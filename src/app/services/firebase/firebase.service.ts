import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { CollectionReference, DocumentData, DocumentReference, arrayUnion, onSnapshot, setDoc } from 'firebase/firestore';
import { User } from '../../interfaces/user';
import { Message } from '../../models/message.class';
import { Emoji } from '../../models/emoji.class';
import { Chat } from '../../models/chat.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private firestore: Firestore = inject(Firestore);
  unsubUsers: any;
  unsubUser: any;

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  users: User[] = [];

  currentUser: User = {
    uid: '',
    name: '',
    email: '',
    avatar: '',
    online: true,
    channelIds: []
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
      this.usersSubject.next(this.users);
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
      .catch((err) => { console.error(err) });
  }

  public getUser(uid: string) {
    return this.users.find((user) => user.uid === uid);
  }

  async connectUser(user: User) {
    if (user && user.uid) {
      let docRef = this.getSingleUser(user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, { online: true }).catch(
          (err) => { console.error(err); }
        );
      } else this.setNewUser(docRef, user);
      this.subUser(user.uid);
    }
  }

  subUser(uid: string) {
    if (this.unsubUser) this.unsubUser();
    this.unsubUser = onSnapshot(this.getSingleUser(uid), (doc) => {
      this.currentUser = doc.data() as User;
    });
  }

  async updateUser(user: User) {
    if (user && user.uid) {
      let docRef = this.getSingleUser(user.uid);
      await updateDoc(docRef, this.getJSONFromUser(user))
        .catch((err) => { console.error(err) })
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

  async getDirectChatId(uid: string, pid: string) {
    let cid = '';
    const user = this.getUser(uid);
    if (user?.directChatIds) {
      for (let i = 0; i < user.directChatIds.length; i++) {
        if (await this.checkThisChat(user?.directChatIds[i], uid, pid)) {
          cid = user?.directChatIds[i];
          if (cid && cid != '') {
            return cid;
          }
        }
      }
    }
    return await this.setDirectChat(uid, pid);
  }

  async setThread(cid: string, mid: string) {
    const messageRef = doc(this.getDirectChatMessagesRef(cid), mid);
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const ref = collection(messageRef, 'thread');
      let message = messageDoc.data() as Message;
      message.answerCount = 0;
      message.isAnswer = true;
      const refNewThreadMessage = await addDoc(ref, message);
      await updateDoc(doc(ref, refNewThreadMessage.id), { tid : refNewThreadMessage.id });
      await updateDoc(messageRef, { thread: refNewThreadMessage.id });
    }
  }

  async addThreadMessage(cid: string, mid: string, message: Message) {
    const ref = collection(doc(this.getDirectChatMessagesRef(cid), mid), 'thread');
    const messageDoc = await addDoc(ref, JSON.parse(JSON.stringify(message)));
    await updateDoc(doc(ref, messageDoc.id), { tid: messageDoc.id });
  }

  async checkThisChat(cid: string, uid: string, pid: string) {
    const result = await getDoc(doc(collection(this.firestore, 'chats'), cid));
    if (result.exists()) {
      const chat = result.data() as Chat;
      if (uid === pid) {
        if (chat.uids.includes(uid) && chat.uids.length == 1) {
          return true;
        }
      } else
        if (chat.uids.includes(uid) && chat.uids.includes(pid) && chat.uids.length == 2) {
          if (!this.currentUser.directChatIds?.includes(cid)) {
            this.currentUser.directChatIds?.push(cid);
            await this.updateUser(this.currentUser);
          }
          return true;
        }
    }
    return false;
  }

  async setDirectChat(uid: string, pid: string) {
    let cid = '';
    if (uid == pid) {
      const ref = await addDoc(collection(this.firestore, 'chats'), { uids: [uid] });
      cid = ref.id;
      let user = this.getUser(uid);
      await this.addChatToUser(user!, cid);
    } else
      await addDoc(collection(this.firestore, 'chats'), { uids: [uid, pid] })
        .then(async (ref) => {
          cid = ref.id;
          let user = this.getUser(uid);
          let partner = this.getUser(pid);
          await this.addChatToUser(user!, cid);
          await this.addChatToUser(partner!, cid);
        })
    return cid;
  }

  async addChatToUser(user: User, cid: string) {
    if (user) {
      if (!user.directChatIds) user.directChatIds = [];
      if (!user.directChatIds.includes(cid)) {
        user.directChatIds.push(cid);
        await this.updateUser(user);
      }
    }
  }

  getDirectChatMessagesRef(chatId: string) {
    return collection(doc(this.getChatsRef(), chatId), 'messages');
  }

  async sendMessage(chatId: string, uid: string, timestamp: number, message: string) {
    return await addDoc(collection(this.getSingleChat(chatId), 'messages'), { uid: uid, timestamp: timestamp, text: message, emojis: [] });
  }

  async updateMessage(cid: string, mid: string, data: any) {
    await updateDoc(doc(this.getDirectChatMessagesRef(cid), mid), this.getJsonFromObject(data));
  }

  async updateRefMessage(ref: DocumentReference<DocumentData, DocumentData>, data: Message) {
    await updateDoc(ref, this.getJsonFromObject(data));
  }


  getJsonFromObject(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }
}
