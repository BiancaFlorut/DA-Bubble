import { Injectable, inject, OnDestroy, signal } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';
import { User } from '../../interfaces/user';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class FirebaseChannelService implements OnDestroy {
  public firestore: Firestore = inject(Firestore);
  public firebaseService: FirebaseService = inject(FirebaseService);
  public userService: UserService = inject(UserService);

  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

  public channels: Channel[] = [];
  public usersFromChannel: User[] = [];
  public userChannels: any[] = [];

  public channel: Channel = {
    id: '',
    name: '',
    description: '',
    creator: '',
  };
  messages: Message[] = [];
  subMessages: any;

  public currentChannelName: string = '';
  public openCreatedChannel: boolean = false;

  private unsubChannels: any;

  constructor() {
    this.getChannels();
    this.channels$.subscribe(channels => {
      this.firebaseService.users$.subscribe(users => {
        this.processChannels(channels, users);
      });
    });
  }

  private getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  public async addNewChannel() {
    await addDoc(this.getChannelsRef(), this.channel)
      .then(async res => {
        this.channel.id = res.id;
        await this.updateChannel(res.id);
        this.userService.currentChannel = res.id;
        this.firebaseService.currentUser.channelIds?.push(res.id);
        this.firebaseService.updateUser(this.firebaseService.currentUser);
      })
      .catch(err => {
        console.error(err)
      });
  }

  public getSingleChannel(docId: string) {
    return doc(this.getChannelsRef(), docId);
  }

  public async updateChannel(id: string) {
    let docRef = this.getSingleChannel(id);
    await updateDoc(docRef, this.getJSONFromChannel(this.channel));
  }

  private getJSONFromChannel(channel: Channel) {
    return JSON.parse(JSON.stringify(channel));
  }

  public getChannels() {
    this.unsubChannels = onSnapshot(this.getChannelsRef(), querySnapshot => {
      this.channels = [];
      querySnapshot.forEach(doc => {
        this.channels.push(doc.data() as Channel);
      });
      this.channelsSubject.next(this.channels);
    });
  }

  public processChannels(channels: Channel[], users: User[]): void {
    if (channels.length > 0) {
      this.userChannels = [];
      channels.forEach(channel => {
        users.forEach(user => {
          user.channelIds?.forEach(id => {
            if (user.uid === this.userService.user.uid) {
              if (id === channel.id) {
                if (!this.userChannels.includes(channel)) {
                  this.userChannels.push(channel);
                }
              }
            }
          });
        });
      });
    }
  }

  ngOnDestroy() {
    if (this.unsubChannels) {
      this.unsubChannels();
    }
  }

  public async deleteChannel(channelId: string) {
    console.log(channelId)
    const channelDocRef = this.getSingleChannel(channelId);
    await deleteDoc(channelDocRef);
  }

  resetChannel() {
    this.channel = {
      id: '',
      name: '',
      description: '',
      creator: '',
    };
  }

  isChannelSet(): boolean {
    return this.channel.id !== '';
  }

  async sendMessage(text: string) {
    const message = new Message('', this.firebaseService.currentUser.uid!, text, Date.now(), []);
    const channelDocRef = this.getSingleChannel(this.channel.id);
    const messageDocRef = await addDoc(collection(channelDocRef, 'messages'), this.getJSONFromObject(message));
    await updateDoc(doc(collection(channelDocRef, 'messages'), messageDocRef.id), { mid: messageDocRef.id });
  }

  getJSONFromObject(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  subscribeToMessages() {
    const channelDocRef = this.getSingleChannel(this.channel.id);
    if (this.subMessages) this.subMessages();
    this.subMessages = onSnapshot(collection(channelDocRef, 'messages'), querySnapshot => {
      this.messages = [];
      querySnapshot.forEach(doc => {
        this.messages.push(doc.data() as Message);
      });
      this.messages = this.messages.sort((a, b) => b.timestamp - a.timestamp);
    })
  }
}