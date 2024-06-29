import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../interfaces/user';
import { FirebaseService } from '../firebase/firebase.service';
import { DirectChat } from '../../models/direct-chat.class';
import { Message } from '../../models/message.class';
import { DocumentData, DocumentReference, collection, onSnapshot } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chat: DirectChat | undefined;
  chatSub: BehaviorSubject<DirectChat | undefined>
  currentChat;
  currentPartner: User = {
    uid: '',
    name: '',
    email: '',
    avatar: '',
    online: false
  };
  loading: boolean = false;
  newMessage: boolean = true;
  firebase = inject(FirebaseService);
  constructor() {
    this.chatSub = new BehaviorSubject<DirectChat | undefined>(this.chat);
    this.currentChat = this.chatSub.asObservable();
  }

  async setChatWith(partner: User) {
    this.loading = true;
    const cid = await this.firebase.connectChatWithUser(this.firebase.currentUser, partner);
    if (cid) {
      this.currentPartner = partner;
      onSnapshot(this.firebase.getDirectMessagesRef(cid), (collection) => {
        let msgs = [] as Message[];
        collection.forEach((doc) => {
          let msg = new Message(doc.data()['uid'], doc.data()['text'], doc.data()['timestamp']);
          msgs.push(msg);
        });
        this.setSubscriber(cid, partner, msgs);
      });
    }
    else
      console.log('something went wrong in chat service setChatWith');
  }

  setSubscriber( cid: string, partner: User, msgs: Message[] ) {
    let chat: DirectChat = new DirectChat(cid, this.firebase.currentUser, partner, msgs);
    this.chatSub.next(chat);
    this.loading = false;
  }
}

