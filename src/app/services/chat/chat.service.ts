import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../interfaces/user';
import { FirebaseService } from '../firebase/firebase.service';
import { Chat } from '../../models/chat.class';
import { Message } from '../../models/message.class';
import { onSnapshot } from 'firebase/firestore';
import { Emoji } from '../../models/emoji.class';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  chat!: Chat | undefined;
  chatSub: BehaviorSubject<Chat | undefined>
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
  signalChat = signal(this.chat);
  constructor() {
    this.chatSub = new BehaviorSubject<Chat | undefined>(this.chat);
    this.currentChat = this.chatSub.asObservable();
  }

  resetChat() {
    this.chat = undefined;
    this.signalChat.set(this.chat);
    this.chatSub = new BehaviorSubject<Chat | undefined>(this.chat);
    this.currentChat = this.chatSub.asObservable();
    this.newMessage = true;
  }

  async getChatWith(partner: User) {
    const user = this.firebase.currentUser;
    console.log('user: ', user);
    console.log('partner: ', partner);
    const cid = await this.firebase.getDirectChatId(user.uid!, partner.uid!);
    console.log('cid: ', cid);
    this.loading = true;
    if (cid && cid != '') {
      this.newMessage = false;
      onSnapshot(this.firebase.getDirectChatMessagesRef(cid), (collection) => {
        let msgs = [] as Message[];
        collection.forEach((doc) => {
          let msg = this.getMessage(doc);
          msgs.push(msg);
        });
        this.setSubscriber(cid, partner, msgs);
      })
    }
    this.currentPartner = partner;
  }

  getMessage(doc: any) {
    const emojis = doc.data()['emojis'] as Emoji[];
    let msg = new Message(doc.data()['mid'], doc.data()['uid'], doc.data()['text'], doc.data()['timestamp'], emojis);
    if (doc.data()['editedTimestamp']) msg.editedTimestamp = doc.data()['editedTimestamp'];
    return msg;
  }

  setSubscriber(cid: string, partner: User, msgs: Message[]) {
    let chat: Chat = new Chat(cid, [this.firebase.currentUser.uid!, partner.uid!], msgs);
    this.chat = chat;
    console.log(this.chat);
    this.signalChat.set(chat);
    this.chatSub.next(chat);
    this.loading = false;
  }

  editMessage(cid: string, message: Message) {
    if (message.mid)
      this.firebase.updateMessage(cid, message.mid, message);

  }
}
