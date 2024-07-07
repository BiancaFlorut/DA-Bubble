import { Injectable, signal } from '@angular/core';
import { Message } from '../../../models/message.class';
import { Chat } from '../../../models/chat.class';

@Injectable({
  providedIn: 'root'
})
export class ThreadChatService {
  isThreadChat = signal(false);
  message!: Message;
  chat: Chat | undefined = undefined;
  signalThreadChat = signal<Chat | undefined>(this.chat);
  constructor() { 
  }

  setThreadChat(message: Message, chat: Chat) {
    this.message = message;
    this.chat = chat;
    console.log('new Thread with the chat', this.chat);
    this.isThreadChat.set(true);
    this.signalThreadChat.set(this.chat);
  }
  
  exitThread() {
    this.chat = undefined;
    this.isThreadChat.set(false);
    this.signalThreadChat.set(this.chat);
  }
}
