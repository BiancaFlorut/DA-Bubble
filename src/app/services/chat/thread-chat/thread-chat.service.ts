import { inject, Injectable, signal } from '@angular/core';
import { Message } from '../../../models/message.class';
import { Chat } from '../../../models/chat.class';
import { FirebaseService } from '../../firebase/firebase.service';
import { collection, doc, getCountFromServer, onSnapshot, Unsubscribe } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ThreadChatService {
  openSideThread = signal(false);
  message!: Message;
  chat: Chat | undefined = undefined;
  signalThreadChat = signal<Chat | undefined>(this.chat);
  firebase = inject(FirebaseService);
  messages: Message[] = [];
  unsubMessages: Unsubscribe | undefined;
  constructor() {
  }

  openThreadChat(message: Message, chat: Chat) {
    this.message = message;
    this.chat = chat;
    this.getMessages();
    this.openSideThread.set(true);
    this.signalThreadChat.set(this.chat);
  }

  setThreadChat(message: Message, chat: Chat) {
    this.message = message;
    this.chat = chat;
  }

  exitThread() {
    this.chat = undefined;
    this.openSideThread.set(false);
    this.signalThreadChat.set(this.chat);
  }

  getMessages() {
    const ref = collection(doc(this.firebase.getDirectChatMessagesRef(this.chat?.cid!), this.message.mid), 'thread');
    if (this.unsubMessages) this.unsubMessages();
    this.unsubMessages = onSnapshot(ref, (collection) => {
      this.messages = [];
      collection.forEach((doc) => {
        this.messages.push(doc.data() as Message);
      });
      this.messages = this.messages.sort((a, b) => a.timestamp - b.timestamp);
    })
  }

  async getAnswerCount(mid: string, cid: string) {
    const ref = collection(doc(this.firebase.getDirectChatMessagesRef(cid), mid), 'thread');
    const snapshot = await getCountFromServer(ref);
    return snapshot.data().count;
  }

  async editMessage(message: Message, cid: string) {
    if (message) {
      const ref = doc(collection(doc(this.firebase.getDirectChatMessagesRef(cid), message.mid), 'thread'), message.tid);
      await this.firebase.updateRefMessage(ref, message);
    } else console.log('no message to edit');
    

  }

  onNgDestroy() {
    if (this.unsubMessages) this.unsubMessages();
  }
}
