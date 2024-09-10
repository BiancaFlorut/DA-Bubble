import { inject, Injectable, signal } from '@angular/core';
import { Message } from '../../../models/message.class';
import { Chat } from '../../../models/chat.class';
import { FirebaseService } from '../../firebase/firebase.service';
import { collection, doc, getCountFromServer, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { FirebaseChannelService } from '../../firebase-channel/firebase-channel.service';
import { User } from '../../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class ThreadChatService {
  openSideThread = signal(false);
  message = signal({} as Message);
  chat = signal<Chat | undefined>(undefined);
  firebase = inject(FirebaseService);
  messages = signal<Message[]>([]);
  unsubMessages: Unsubscribe | undefined;
  channelService = inject(FirebaseChannelService);
  loading = signal(false);
  users: User[] = [];


  /**
   * Opens a thread chat for the given message and chat.
   * Sets openSideThread to true, sets loading to true, sets message to the given message, and
   * sets chat to the given chat if it is not a channel, otherwise sets chat to undefined.
   * Then it gets all messages of the chat and sets openSideThread to true again and sets loading to false.
   * @param message The message for which the thread chat should be opened.
   * @param chat The chat for which the thread chat should be opened.
   */
  openThreadChat(message: Message, chat: Chat) {
    this.exitThread();
    this.openSideThread.set(true);
    this.loading.set(true);
    this.message.set(message);
    if (this.channelService.isChannelSet()) {
      this.chat.set(undefined);
      this.users = this.channelService.usersFromChannel;
    } else {
      this.chat.set(chat);
      for (let uid of this.chat()!.uids) {
        this.users.push(this.firebase.getUser(uid)!);
      }
    }
    this.getMessages();
    this.openSideThread.set(true);
    this.loading.set(false);
  }

  /**
   * Sets the message and chat of the thread chat.
   * @param message The message for which the thread chat should be set.
   * @param chat The chat for which the thread chat should be set.
   */
  setThreadChat(message: Message, chat: Chat) {
    this.message.set(message);
    this.chat.set(chat);
  }

  /**
   * Resets the thread chat to its initial state.
   * Sets the chat to undefined, the messages to an empty array, and openSideThread to false.
   */
  exitThread() {
    this.chat.set(undefined);
    this.messages.set([]);
    this.openSideThread.set(false);
  }

  /**
   * Gets all messages of a thread in a direct chat or a channel.
   * The messages are sorted by their timestamp in ascending order.
   * If the thread is not found, a console error is logged.
   */
  getMessages() {
    let ref;
    if (!this.channelService.isChannelSet()) {
      ref = collection(doc(this.firebase.getDirectChatMessagesRef(this.chat()!.cid!), this.message().mid), 'thread');
    } else {
      ref = this.channelService.getChannelThreadForMessage(this.message().mid);
    }
    if (ref){
      if (this.unsubMessages) this.unsubMessages();
      this.unsubMessages = onSnapshot(ref, (collection) => {
        let msgs: Message[] = [];
        collection.forEach((doc) => {
          msgs.push(doc.data() as Message);
        });
        msgs = msgs.sort((a, b) => a.timestamp - b.timestamp);
        this.messages.set(msgs);
        
      })
    } else console.log('no ref found for the messages');
  }

  /**
   * Gets the number of answers in a thread in a direct chat or a channel.
   * @param mid The id of the message for which the number of answers should be retrieved.
   * @param cid The id of the direct chat to which the message belongs.
   * @returns The number of answers in the thread.
   */
  async getAnswerCount(mid: string, cid: string) {
    let ref;
    if (this.channelService.isChannelSet()) {
      ref = collection(this.channelService.getCurrentChannelRef(), 'thread');
    } else
      ref = collection(doc(this.firebase.getDirectChatMessagesRef(cid), mid), 'thread');
    const snapshot = await getCountFromServer(ref);
    return snapshot.data().count;
  }

  /**
   * Edits a message in a thread in a direct chat or a channel.
   * If the message is in a direct chat, the id of the direct chat is needed.
   * If no message is given, a console error is logged.
   * @param message The message to edit
   * @param cid The id of the direct chat to which the message belongs
   */
  async editMessage(message: Message, cid: string) {
    if (message) {
      if (this.channelService.isChannelSet()) {
        const ref = doc(this.channelService.getChannelThreadForMessage(message.mid), message.tid);
        await this.firebase.updateRefMessage(ref, message);
      }
      else if (this.chat()) {
        const ref = doc(collection(doc(this.firebase.getDirectChatMessagesRef(cid), message.mid), 'thread'), message.tid);
        await this.firebase.updateRefMessage(ref, message);
      }
    } else console.log('no message to edit');
  }

  /**
   * This function is called when the component is destroyed. It unsubscribes from all subscriptions
   * that were created in this service to prevent memory leaks.
   */
  onNgDestroy() {
    if (this.unsubMessages) this.unsubMessages();
  }
}
