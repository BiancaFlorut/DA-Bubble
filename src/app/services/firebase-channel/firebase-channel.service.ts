import { Injectable, inject } from '@angular/core';
import { Channel } from '../../interfaces/channel';
import { DocumentData, DocumentReference, addDoc, collection, setDoc } from 'firebase/firestore';
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

  getUsersRef() {
    return collection(this.firestore, 'channels');
  }

  async addNewChannel() {
    await addDoc(this.getUsersRef(), this.channel)
      .catch((err) => { console.error(err) })
      .then((res) => {
        console.log('Adding user finished: ', res);
      }
      )
  }
}
