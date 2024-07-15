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
  constructor() {
    this.chatSub = new BehaviorSubject<Chat | undefined>(this.chat);
    this.currentChat = this.chatSub.asObservable();
  }

  resetChat() {
    this.chat = undefined;
    this.chatSub = new BehaviorSubject<Chat | undefined>(this.chat);
    this.currentChat = this.chatSub.asObservable();
    this.newMessage = true;
  }

  async getChatWith(partner: User) {
    const user = this.firebase.currentUser;
    const cid = await this.firebase.getDirectChatId(user.uid!, partner.uid!);
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
      this.currentPartner = partner;
      return true;
    } else return false;
  }

  getMessage(doc: any) {
    const emojis = doc.data()['emojis'] as Emoji[];
    let msg = new Message(doc.data()['mid'], doc.data()['uid'], doc.data()['text'], doc.data()['timestamp'], emojis);
    if (doc.data()['editedTimestamp']) msg.editedTimestamp = doc.data()['editedTimestamp'];
    if (doc.data()['isAnswer']) msg.isAnswer = doc.data()['isAnswer'];
    if (doc.data()['answerCount']) msg.answerCount = doc.data()['answerCount'];
    if (doc.data()['lastAnswerTimestamp']) msg.lastAnswerTimestamp = doc.data()['lastAnswerTimestamp'];
    return msg;
  }

  setSubscriber(cid: string, partner: User, msgs: Message[]) {
    let chat: Chat = new Chat(cid, [this.firebase.currentUser.uid!, partner.uid!], msgs);
    this.chat = chat;
    this.chatSub.next(chat);
    this.loading = false;
  }

  async editMessage(cid: string, message: Message) {
    if (message.mid)
      await this.firebase.updateMessage(cid, message.mid, message);
  }
}
