import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../interfaces/user';
import { FirebaseService } from '../firebase/firebase.service';
import { DirectChat } from '../../models/direct-chat.class';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chat: DirectChat | undefined;
  chatSub: BehaviorSubject<DirectChat | undefined>
  currentChat;
  firebase = inject(FirebaseService);
  constructor() {
    this.chatSub = new BehaviorSubject<DirectChat | undefined>(this.chat);
    this.currentChat = this.chatSub.asObservable();
  }

  async setChatWith(partner: User) {
    const cid = await this.firebase.connectChatWithUser(this.firebase.currentUser, partner);
    const chat: DirectChat = new DirectChat(cid, this.firebase.currentUser, partner);
    this.chatSub.next(chat);
  }
}
