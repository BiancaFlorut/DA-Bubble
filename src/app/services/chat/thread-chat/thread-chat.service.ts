import { computed, inject, Injectable, signal } from '@angular/core';
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


  openThreadChat(message: Message, chat: Chat) {
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

  setThreadChat(message: Message, chat: Chat) {
    this.message.set(message);
    this.chat.set(chat);
  }

  exitThread() {
    this.chat.set(undefined);
    this.messages.set([]);
    this.openSideThread.set(false);
  }

  getMessages() {
    let ref;
    if (!this.channelService.isChannelSet()) {
      ref = collection(doc(this.firebase.getDirectChatMessagesRef(this.chat()!.cid!), this.message().mid), 'thread');
    } else {
      ref = this.channelService.getChannelThreadForMessage(this.message().mid);
    }
      if (this.unsubMessages) this.unsubMessages();
      this.unsubMessages = onSnapshot(ref, (collection) => {
        let msgs: Message[] = [];
        collection.forEach((doc) => {
          msgs.push(doc.data() as Message);
        });
        msgs = msgs.sort((a, b) => a.timestamp - b.timestamp);
        this.messages.set(msgs);
      })
    
  }

  async getAnswerCount(mid: string, cid: string) {
    let ref;
    if (this.channelService.isChannelSet()) {
      ref = collection(this.channelService.getCurrentChannelRef(), 'thread');
    } else
      ref = collection(doc(this.firebase.getDirectChatMessagesRef(cid), mid), 'thread');
    const snapshot = await getCountFromServer(ref);
    return snapshot.data().count;
  }

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

  onNgDestroy() {
    if (this.unsubMessages) this.unsubMessages();
  }
}
