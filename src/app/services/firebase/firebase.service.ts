import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { DocumentData, DocumentReference, onSnapshot, setDoc } from 'firebase/firestore';
import { User } from '../../interfaces/user';
import { Message } from '../../models/message.class';
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

  /**
   * Initializes the FirebaseService by calling getUsers() to
   * start listening to the 'users' collection.
   */
  constructor() {
    this.getUsers();
  }

  /**
   * Subscribes to the 'users' collection and updates the 'usersSubject'
   * with the latest users when the collection changes.
   * @returns An unsubscribe function that can be used to unsubscribe from the
   * 'users' collection.
   */
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

  /**
   * Returns a reference to the 'users' collection in the firestore.
   * @returns A CollectionReference to the 'users' collection.
   */
  public getUsersRef() {
    return collection(this.firestore, 'users');
  }

  /**
   * Returns a reference to the 'chats' collection in the firestore.
   * @returns A CollectionReference to the 'chats' collection.
   */
  public getChatsRef() {
    return collection(this.firestore, 'chats');
  }

  /**
   * Returns a reference to a single user document in the Firestore.
   * @param docId The id of the user document to retrieve.
   * @returns A DocumentReference to the user document.
   */
  public getSingleUser(docId: string) {
    return doc(this.getUsersRef(), docId)
  }

  /**
   * Returns a reference to a single chat document in the Firestore.
   * @param docId The id of the chat document to retrieve.
   * @returns A DocumentReference to the chat document.
   */
  getSingleChat(docId: string) {
    return doc(this.getChatsRef(), docId)
  }

  /**
   * Sets a new user document in the Firestore.
   * @param docRef The reference of the document to set.
   * @param newUser The user to set.
   */
  public async setNewUser(docRef: DocumentReference<DocumentData, DocumentData>, newUser: User) {
    newUser.online = true;
    await setDoc(docRef, newUser)
      .catch((err) => { console.error(err) });
  }

  /**
   * Finds a user in the list of users by uid.
   * @param uid The uid of the user to find.
   * @returns The user with the given uid, or undefined if no such user exists.
   */
  public getUser(uid: string) {
    return this.users.find((user) => user.uid === uid);
  }

  /**
   * Connects a user in the Firestore.
   * If the user exists in the Firestore, updates the user with online = true.
   * If the user does not exist in the Firestore, sets a new user with online = true.
   * @param user The user to connect.
   */
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

  /**
   * Subscribes to the Firestore document of the given user.
   * Stores the unsubscribe function in `this.unsubUser` to be called in `onNgDestroy()`.
   * Updates `this.currentUser` with the data of the user document.
   * @param uid The id of the user to subscribe to.
   */
  subUser(uid: string) {
    if (this.unsubUser) this.unsubUser();
    this.unsubUser = onSnapshot(this.getSingleUser(uid), (doc) => {
      this.currentUser = doc.data() as User;
    });
  }

  /**
   * Updates a user in the Firestore.
   * @param user The user to update.
   */
  async updateUser(user: User) {
    if (user && user.uid) {
      let docRef = this.getSingleUser(user.uid);
      await updateDoc(docRef, this.getJSONFromUser(user))
        .catch((err) => { console.error(err) })
    }
  }

  /**
   * Called when the Angular component that uses this service is destroyed.
   * Stops listening to the user and users collection.
   */
  onNgDestroy() {
    if (this.unsubUsers) {
      this.unsubUsers();
    }
    if (this.unsubUser) {
      this.unsubUser();
    }
  }

  /**
   * Converts a User object to a JSON object.
   * @param user The user to convert.
   * @returns The JSON object of the user.
   */
  getJSONFromUser(user: User) {
    return JSON.parse(JSON.stringify(user));
  }

  /**
   * Gets the id of a direct chat between two users.
   * If there is no direct chat between the users, a new one is created.
   * @param uid The id of the first user.
   * @param pid The id of the second user.
   * @returns The id of the direct chat between the two users.
   */
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

  /**
   * Sets a message as a thread message of a direct chat.
   * Copies the message into a new document in the 'thread' subcollection
   * and updates the original document with the id of the new thread message.
   * @param cid The id of the direct chat to which the message belongs.
   * @param mid The id of the message to set as a thread message
   */
  async setThread(cid: string, mid: string) {
    const messageRef = doc(this.getDirectChatMessagesRef(cid), mid);
    const messageDoc = await getDoc(messageRef);
    if (messageDoc.exists()) {
      const ref = collection(messageRef, 'thread');
      let message = messageDoc.data() as Message;
      message.answerCount = 0;
      message.isAnswer = true;
      const refNewThreadMessage = await addDoc(ref, message);
      await updateDoc(doc(ref, refNewThreadMessage.id), { tid: refNewThreadMessage.id });
      await updateDoc(messageRef, { thread: refNewThreadMessage.id });
    }
  }

  /**
   * Adds a new message as a thread to an existing message in the given direct chat.
   * @param cid The id of the direct chat to which the new message should be added as a thread.
   * @param mid The id of the message to which the new message should be added as a thread.
   * @param message The message to add as a thread message.
   */
  async addThreadMessage(cid: string, mid: string, message: Message) {
    const ref = collection(doc(this.getDirectChatMessagesRef(cid), mid), 'thread');
    const messageDoc = await addDoc(ref, JSON.parse(JSON.stringify(message)));
    await updateDoc(doc(ref, messageDoc.id), { tid: messageDoc.id });
  }

  /**
   * Checks if a chat with id 'cid' is a direct chat between users with ids 'uid' and 'pid'.
   * @param cid The id of the chat to check.
   * @param uid The id of the first user.
   * @param pid The id of the second user.
   * @returns True if the chat is a direct chat between the two users, false otherwise.
   */
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
          return true;
        }
    }
    return false;
  }

  /**
   * Creates a direct chat between two users and returns the chat id.
   * If the two users are the same, a single user chat is created.
   * @param uid The id of the first user.
   * @param pid The id of the second user.
   * @returns The id of the created direct chat.
   */
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

  /**
   * Adds a chat id to the given user if it does not already exist there.
   * @param user The user to add the chat id to.
   * @param cid The chat id to add.
   */
  async addChatToUser(user: User, cid: string) {
    if (user) {
      if (!user.directChatIds) user.directChatIds = [];
      if (!user.directChatIds.includes(cid)) {
        user.directChatIds.push(cid);
        await this.updateUser(user);
      }
    }
  }

  /**
   * Returns a reference to the collection of messages in the given direct chat.
   * @param chatId The id of the direct chat to get the messages from.
   * @returns A reference to the collection of messages in the given direct chat.
   */
  getDirectChatMessagesRef(chatId: string) {
    return collection(doc(this.getChatsRef(), chatId), 'messages');
  }

  /**
   * Sends a message to the given direct chat.
   * @param chatId The id of the direct chat to which the message should be sent.
   * @param uid The id of the user sending the message.
   * @param timestamp The timestamp of the message to be sent.
   * @param message The text of the message to be sent.
   */
  async sendMessage(chatId: string, uid: string, timestamp: number, message: string) {
    return await addDoc(collection(this.getSingleChat(chatId), 'messages'), { uid: uid, timestamp: timestamp, text: message, emojis: [] });
  }

  /**
   * Updates a message in a direct chat.
   * @param cid The id of the direct chat to which the message belongs.
   * @param mid The id of the message to update.
   * @param data The new data for the message. This object is converted to a JSON object
   * before being passed to `updateDoc`.
   */
  async updateMessage(cid: string, mid: string, data: any) {
    await updateDoc(doc(this.getDirectChatMessagesRef(cid), mid), this.getJsonFromObject(data));
  }

  /**
   * Updates a message in the database. This is a convenience wrapper
   * around `updateDoc` that converts the given `data` object to a
   * JSON object using `getJsonFromObject`.
   * @param ref The reference to the document to update.
   * @param data The Message object with the new data. This object is
   * converted to a JSON object before being passed to `updateDoc`.
   */
  async updateRefMessage(ref: DocumentReference<DocumentData, DocumentData>, data: Message) {
    await updateDoc(ref, this.getJsonFromObject(data));
  }

  /**
   * Converts an object to a JSON object, which is then
   * immediately parsed back into a new object. This is
   * useful for creating a deep copy of an object, as the
   * stringification and parsing process removes any
   * existing references to other objects.
   * @param obj The object to convert to a JSON object
   * @returns A new object with the same properties as the
   * original, but with no references to external objects
   */
  getJsonFromObject(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }
}
