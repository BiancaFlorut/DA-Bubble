import { Injectable, WritableSignal, inject, signal } from '@angular/core';
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

  public chat = signal<Chat | undefined>(undefined);

  public currentPartner: User = {
    uid: '',
    name: '',
    email: '',
    avatar: '',
    online: false
  };
  public loading: WritableSignal<boolean> = signal(false);
  public newMessage = signal(true);


  /**
   * Resets the current chat to undefined and sets the newMessage signal to true
   */
  public resetChat(): void {
    this.chat.set(undefined);
    this.newMessage.set(true);
  }

  /**
   * Sets the current chat to undefined
   */
  public closeChat(): void {
    this.chat.set(undefined);
  }

  /**
   * Gets the direct chat with the given partner. If the chat doesn't exist, a new one is created.
   * @param partner The user to get the direct chat with.
   * @returns A promise that resolves to true if the chat was found or created, false otherwise.
   */
  public async getChatWith(partner: User): Promise<boolean> {
    this.loading.set(true);
    const user = this.firebase.currentUser;
    const cid = await this.firebase.getDirectChatId(user.uid!, partner.uid!);
    if (cid && cid != '') {
      this.setActualChat(cid, partner);
      return true;
    } else return false;
  }

  /**
   * Sets the current chat with the given partner and loads the messages from the db.
   * @param cid The id of the chat.
   * @param partner The partner of the chat.
   */
  public setActualChat(cid: string, partner: User): void {
    this.newMessage.set(false);
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

  /**
   * Creates a new Message object from a Firestore document snapshot.
   * @param doc The document snapshot.
   * @returns A new Message object.
   */
  public getMessage(doc: any) {
    const emojis = doc.data()['emojis'] as Emoji[];
    let msg = new Message(doc.data()['mid'], doc.data()['uid'], doc.data()['text'], doc.data()['timestamp'], emojis);
    if (doc.data()['editedTimestamp']) msg.editedTimestamp = doc.data()['editedTimestamp'];
    if (doc.data()['isAnswer']) msg.isAnswer = doc.data()['isAnswer'];
    if (doc.data()['answerCount']) msg.answerCount = doc.data()['answerCount'];
    if (doc.data()['lastAnswerTimestamp']) msg.lastAnswerTimestamp = doc.data()['lastAnswerTimestamp'];
    return msg;
  }

  /**
   * Sets the current chat to the given chat with the given partner and messages.
   * @param cid The id of the chat.
   * @param partner The partner of the chat.
   * @param msgs The messages of the chat.
   */
  public setSubscriber(cid: string, partner: User, msgs: Message[]): void {
    let chat: Chat = new Chat(cid, [this.firebase.currentUser.uid!, partner.uid!], msgs);
    this.chat.set(chat);
    // this.chatSub.next(chat);
    this.loading.set(false);
  }

  /**
   * Edits a message in the given direct chat.
   * @param cid The id of the direct chat to which the message belongs.
   * @param message The message to edit. The message's id is used to identify the message to edit, so
   * it must be set.
   */
  public async editMessage(cid: string, message: Message): Promise<void> {
    if (message.mid)
      await this.firebase.updateMessage(cid, message.mid, message);
  }

  /**
   * Sends a message to a user with the given uid.
   * First, it gets the direct chat id between the current user and the given user.
   * Then it sends the message to the direct chat and updates the message in the direct chat.
   * @param uid The id of the user to which the message should be sent.
   * @param message The text of the message to be sent.
   */
  public async sendMessageToUser(uid: string, message: string): Promise<void> {
    if (uid.length == 0) {
      console.log("no user to send message to");
      return;
    }
    const cid = await this.firebase.getDirectChatId(this.firebase.currentUser.uid!, uid);
    let mid = await this.firebase.sendMessage(cid, this.firebase.currentUser.uid!, Date.now(), message);
    let msg = new Message(mid.id, this.firebase.currentUser.uid!, message, Date.now(), []);
    await this.firebase.updateMessage(cid, mid.id, msg);
  }
}
