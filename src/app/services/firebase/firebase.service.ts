import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, updateDoc } from '@angular/fire/firestore';

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

  public async addUser(newUser: {}) {
    await addDoc(this.getUsers(), newUser)
      .catch((err) => { console.error(err) })
      .then((result) => {
        console.log('Adding user finished: ', result)
      }
      )
  }

  public async updateUser(user: any, id: string) {
    let docRef = this.getSingleUser(id);
    await updateDoc(docRef, user).catch(
      (err) => { console.error(err); }
    );
  }
}
