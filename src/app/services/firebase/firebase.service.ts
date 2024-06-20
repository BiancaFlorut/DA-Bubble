import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { DocumentData, DocumentReference, setDoc } from 'firebase/firestore';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore: Firestore = inject(Firestore);

  public getUsers() {
    return collection(this.firestore, 'users');
  }

  public getSingleUser(docId: string) {
    return doc(this.getUsers(), docId)
  }

  public async setNewUser(docRef: DocumentReference<DocumentData, DocumentData>, newUser: User) {
    newUser.online = true;
    await setDoc(docRef, newUser)
      .catch((err) => { console.error(err) })
      .then((result) => {
        console.log('Adding user in firebase finished: ', result)
      }
      )
  }

  async connectUser(user: User) {
    if (user && user.uid) {
      let docRef = this.getSingleUser(user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        updateDoc(docRef, { online: true }).catch(
          (err) => { console.error(err); }
        );
        console.log('User updated: ', docSnap.data());
      } else this.setNewUser(docRef, user);
    }
  }
}
