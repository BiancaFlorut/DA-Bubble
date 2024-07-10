import { Injectable, inject, OnDestroy, CSP_NONCE } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';
import { User } from '../../interfaces/user';
import { BehaviorSubject } from 'rxjs';

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

  public channel: Channel = {
    id: '',
    name: '',
    description: '',
    creator: '',
  };

  public currentChannelName: string = '';
  public openCreatedChannel: boolean = false;

  private unsubChannels: any;

  constructor() {
    this.getChannels();
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
        this.getChannels();
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

  ngOnDestroy() {
    if (this.unsubChannels) {
      this.unsubChannels();
    }
  }
}