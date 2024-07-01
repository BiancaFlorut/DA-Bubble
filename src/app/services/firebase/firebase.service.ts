import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { DocumentData, DocumentReference, onSnapshot, setDoc } from 'firebase/firestore';
import { User } from '../../interfaces/user';
import { Message } from '../../models/message.class';
import { Emoji } from '../../models/emoji.class';

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
  msgs: Message[] = [];

  constructor() {
    this.getUsers();
  }

  public getUsers() {
    this.users = [];
    this.unsubUsers = onSnapshot(this.getUsersRef(), (querySnapshot) => {
      this.users = [];
      querySnapshot.forEach((doc) => {
        this.users.push(doc.data() as User);
      });
    })
  }

  public getUsersRef() {
    return collection(this.firestore, 'users');
  }

  public getChatsRef() {
    return collection(this.firestore, 'chats');
  }

  public getSingleUser(docId: string) {
    return doc(this.getUsersRef(), docId)
  }

  getSingleChat(docId: string) {
    return doc(this.getChatsRef(), docId)
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

  async connectChatWithUser(user: User, partner: User) {
    if (user && user.uid && partner && partner.uid) {
      let docRef = this.getSingleChat(user.uid + partner.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data()['cid'];
      } else {
        docRef = this.getSingleChat(partner.uid + user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data()['cid'];
        }
      }
      return this.setNewChat(docRef, user, partner);
    }
    console.log('Something went wrong in connectChatWithUser');
    return '';
  }

  async setNewChat(docRef: DocumentReference<DocumentData>, user: User, partner: User) {
    await setDoc(docRef, { cid: docRef.id, uid: user.uid, pid: partner.uid, uName: user.name, pName: partner.name });
    return docRef.id;
  }

  async sendMessage(chatId: string, uid: string, timestamp: number, message: string) {
    return await addDoc(collection(this.getSingleChat(chatId), 'messages'), { uid: uid, timestamp: timestamp, text: message, emojis: [] });
  }

  updateMessage(cid: string, mid: string, data: any) {
    if (data.editedTimestamp)
      updateDoc(doc(this.getDirectMessagesRef(cid), mid), { text: data.text, editedTimestamp: data.editedTimestamp });
    else
      updateDoc(doc(this.getDirectMessagesRef(cid), mid), { timestamp: data.timestamp, text: data.text, mid: mid, emojis: this.getEmojisJson(data.emojis) });
  }

  getDirectMessagesRef(chatId: string) {
    return collection(this.getSingleChat(chatId), 'messages');
  }

  getEmojisJson(emojis: Emoji[]) {
    return JSON.parse(JSON.stringify(emojis));
  }
}
