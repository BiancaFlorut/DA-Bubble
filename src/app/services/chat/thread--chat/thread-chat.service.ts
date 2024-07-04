import { Injectable, signal } from '@angular/core';
import { Message } from '../../../models/message.class';

@Injectable({
  providedIn: 'root'
})
export class ThreadChatService {
  isThreadChat = signal(false);
  message!: Message;
  constructor() { 
  }

  setThreadChat(message: Message) { 
    console.log('setThreadChat', message);
    this.isThreadChat.set(true);
  }
  
  exitThread() {
    this.isThreadChat.set(false);
  }
}
