import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
  public firebase: FirebaseService = inject(FirebaseService);

  public chat!: Chat | undefined;
  private chatSub: BehaviorSubject<Chat | undefined>
  public currentChat: Observable<Chat | undefined>;

  public currentPartner: User = {
    uid: '',
    name: '',
    email: '',
    avatar: '',
    online: false
  };
  public loading: WritableSignal<boolean> = signal(false);
  public newMessage: boolean = true;

  constructor() {
    this.chatSub = new BehaviorSubject<Chat | undefined>(this.chat);
    this.currentChat = this.chatSub.asObservable();
  }

  public resetChat(): void {
    this.chat = undefined;
    this.chatSub = new BehaviorSubject<Chat | undefined>(this.chat);
    this.currentChat = this.chatSub.asObservable();
    this.newMessage = true;
  }

  public closeChat(): void {
    this.chat = undefined;
    this.chatSub.next(this.chat);
  }

  public async getChatWith(partner: User): Promise<boolean> {
    this.loading.set(true);
    const user = this.firebase.currentUser;
    const cid = await this.firebase.getDirectChatId(user.uid!, partner.uid!);
    if (cid && cid != '') {
      this.setActualChat(cid, partner);
      return true;
    } else return false;
  }

  public setActualChat(cid: string, partner: User): void {
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
  }

  public getMessage(doc: any) {
    const emojis = doc.data()['emojis'] as Emoji[];
    let msg = new Message(doc.data()['mid'], doc.data()['uid'], doc.data()['text'], doc.data()['timestamp'], emojis);
    if (doc.data()['editedTimestamp']) msg.editedTimestamp = doc.data()['editedTimestamp'];
    if (doc.data()['isAnswer']) msg.isAnswer = doc.data()['isAnswer'];
    if (doc.data()['answerCount']) msg.answerCount = doc.data()['answerCount'];
    if (doc.data()['lastAnswerTimestamp']) msg.lastAnswerTimestamp = doc.data()['lastAnswerTimestamp'];
    return msg;
  }

  public setSubscriber(cid: string, partner: User, msgs: Message[]): void {
    let chat: Chat = new Chat(cid, [this.firebase.currentUser.uid!, partner.uid!], msgs);
    this.chat = chat;
    this.chatSub.next(chat);
    this.loading.set(false);
  }

  public async editMessage(cid: string, message: Message): Promise<void> {
    if (message.mid)
      await this.firebase.updateMessage(cid, message.mid, message);
  }

  public async sendMessageToUser(uid: string, message: string): Promise<void> {
    const partner = this.firebase.getUser(uid)!;
    if (uid.length == 0) {
      console.log("no user to send message to");
      return;
    }
    if (partner) {
      const cid = await this.firebase.getDirectChatId(this.firebase.currentUser.uid!, uid);
      const mid = await this.firebase.sendMessage(cid, this.firebase.currentUser.uid!, Date.now(), message);
      if (mid) console.log("sent message to: " + partner.name + " cid: " + cid + " mid: " + mid.id);

    }
  }
}
