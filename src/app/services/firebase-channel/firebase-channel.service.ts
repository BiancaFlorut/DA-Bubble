import { Injectable, inject } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { DocumentData, DocumentReference, addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseChannelService {
  firestore = inject(Firestore);

  channel: Channel = {
    name: '',
    description: '',
    creator: '',
  };

  getChannelRef() {
    return collection(this.firestore, 'channels');
  }

  async addNewChannel() {
    await addDoc(this.getChannelRef(), this.channel)
      .then(res => {
        console.log('Adding user finished: ', res);
      })
      .catch(err => {
        console.error(err)
      });
  }

  async getAllChannels() {
    const querySnapshot = await getDocs(this.getChannelRef());
    return querySnapshot.docs.map(doc => doc.data() as Channel);
  }
}
