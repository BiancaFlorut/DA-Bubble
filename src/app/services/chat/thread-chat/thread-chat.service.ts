import { inject, Injectable, signal } from '@angular/core';
import { Message } from '../../../models/message.class';
import { Chat } from '../../../models/chat.class';
import { FirebaseService } from '../../firebase/firebase.service';
import { collection, doc, onSnapshot, Unsubscribe } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ThreadChatService {
  isThreadChat = signal(false);
  message!: Message;
  chat: Chat | undefined = undefined;
  signalThreadChat = signal<Chat | undefined>(this.chat);
  firebase = inject(FirebaseService);
  messages: Message[] = [];
  unsubMessages: Unsubscribe | undefined;
  constructor() {
  }

  setThreadChat(message: Message, chat: Chat) {
    this.message = message;
    this.chat = chat;
    this.isThreadChat.set(true);
    this.signalThreadChat.set(this.chat);
    this.getMessages();
  }

  exitThread() {
    this.chat = undefined;
    this.isThreadChat.set(false);
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

  onNgDestroy() {
    if (this.unsubMessages) this.unsubMessages();
  }
}
