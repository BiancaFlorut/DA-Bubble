import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { DocumentData, DocumentReference, onSnapshot, setDoc } from 'firebase/firestore';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore: Firestore = inject(Firestore);
  unsubUsers: any;
  unsubUser: any;
  users: User[] = [];
  currentUser: User = {
    uid: '',
    name: '',
    email: '',
    avatar: '',
    online: true
  };

  constructor() { 
    this.getUsers();
  }

  public getUsers() {
    this.users = [];
    this.unsubUsers = onSnapshot(this.getUsersRef(), (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        this.users.push(doc.data() as User);
      });
    })
  }

  public getUsersRef() {
    return collection(this.firestore, 'users');
  }

  public getSingleUser(docId: string) {
    return doc(this.getUsersRef(), docId)
  }

  public async setNewUser(docRef: DocumentReference<DocumentData, DocumentData>, newUser: User) {
    newUser.online = true;
    await setDoc(docRef, newUser)
      .catch((err) => { console.error(err) })
      .then((result) => {
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
      } else this.setNewUser(docRef, user);
      this.subUser(user.uid);
    }
    
  }

  subUser(uid: string) {
    this.unsubUser = onSnapshot(this.getSingleUser(uid), (doc) => {
        this.currentUser = doc.data() as User;
        console.log('Current user is actual:', this.currentUser);
        
      });
  }

  updateUser(user: User) {
    if (user && user.uid) {
      let docRef = this.getSingleUser(user.uid);
      updateDoc(docRef, this.getJSONFromUser(user))
        .catch((err) => { console.error(err) })
        .then((result) => {
          console.log('User updated:', result);
        }
        )
    }
  }

  onNgDestroy() {
    if (this.unsubUsers) {
      this.unsubUsers();
    }
    if (this.unsubUser) {
      this.unsubUser();
    }
  }

  getJSONFromUser(user: User) {
    return JSON.parse(JSON.stringify(user));
  }
}
