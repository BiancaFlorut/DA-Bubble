import { Injectable, inject } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { addDoc, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseChannelService {
  public firestore = inject(Firestore);
  public firebaseService: FirebaseService = inject(FirebaseService);
  public userService: UserService = inject(UserService);

  channels: Channel[] = [];
  unsubChannels: any;
  channel: Channel = {
    name: '',
    description: '',
    creator: '',
  };

  constructor() {
    this.getAllChannels();
  }

  onNgDestroy() {
    if (this.unsubChannels) {
      this.unsubChannels();
    }
  }

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  async addNewChannel() {
    await addDoc(this.getChannelRef(), this.channel)
      .then(async res => {
        console.log('Adding user finished: ', res);
        this.userService.currentChannel = res.id;
        this.firebaseService.currentUser.channelIds?.push(res.id);
        this.firebaseService.updateUser(this.firebaseService.currentUser);
      })
      .catch(err => {
        console.error(err)
      });
  }

  public getSingleChannel(docId: string) {
    return doc(this.getChannelRef(), docId)
  }

  async updateChannel(id: string) {
    let docRef = this.getSingleChannel(id);
    await updateDoc(docRef, this.getJSONFromChannel(this.channel));
  }

  getJSONFromChannel(channel: Channel) {
    return JSON.parse(JSON.stringify(channel));
  }

  async getAllChannels() {
    this.channels = [];

    this.unsubChannels = onSnapshot(this.getChannelRef(), querySnapshot => {
      this.channels = [];
      querySnapshot.forEach(doc => {
        this.channels.push(doc.data() as Channel);
      });
    });
  }
}
