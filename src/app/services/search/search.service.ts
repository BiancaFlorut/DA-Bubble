import { inject, Injectable } from '@angular/core';
import { ChatService } from '../chat/chat.service';
import { Channel } from '../../interfaces/channel';
import { ThreadChatService } from '../chat/thread-chat/thread-chat.service';
import { FirebaseChannelService } from '../firebase-channel/firebase-channel.service';
import { ToggleDNoneService } from '../toggle-d-none/toggle-d-none.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserService } from '../user/user.service';
import { CreateChannelService } from '../create-channel/create-channel.service';
import { User } from '../../interfaces/user';
import { Message } from '../../models/message.class';
import { collection, DocumentData, getDoc, getDocs, QuerySnapshot } from 'firebase/firestore';
import { ScrollService } from '../scroll/scroll.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private chatService: ChatService = inject(ChatService);
  private threadChatService: ThreadChatService = inject(ThreadChatService);
  private firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  private toggleDNone: ToggleDNoneService = inject(ToggleDNoneService);
  private firebaseService: FirebaseService = inject(FirebaseService);
  private userService: UserService = inject(UserService);
  private createChannelService: CreateChannelService = inject(CreateChannelService);
  private channelService: FirebaseChannelService = inject(FirebaseChannelService);
  private scrollService: ScrollService = inject(ScrollService);

  public foundChannels: Channel[] = [];
  public foundUsers: User[] = [];
  public foundMessages: { user: User, message: Message, channel?: Channel, chatId: string | undefined }[] = [];

  public search: string = '';

  public getAllUsersFromChannel(channel: Channel): void {
    this.chatService.closeChat();
    this.threadChatService.exitThread();
    this.chatService.newMessage.set(false);
    this.filterUsersByChannel(channel);
    this.updateChannelVisibility(channel);
    this.firebaseChannelService.subscribeToMessages();
    this.toggleDNone.toggleIsClassRemoved();
  }

  private filterUsersByChannel(channel: Channel): void {
    this.firebaseService.users$.subscribe(users => {
      this.firebaseChannelService.usersFromChannel = [];
      users.forEach(user => {
        user.channelIds?.forEach(id => {
          if (id === channel.id) {
            this.firebaseChannelService.usersFromChannel.push(user);
            this.firebaseChannelService.channel = channel;
          }
        });
      });
    });
  }

  private updateChannelVisibility(channel: Channel): void {
    this.userService.currentChannel = channel.id;
    this.createChannelService.showChannel = true;
    this.createChannelService.showCreateChannel = false;
    this.firebaseChannelService.openCreatedChannel = true;
  }

  public async openDirectChat(partner: User): Promise<void> {
    this.chatService.closeChat();
    this.firebaseChannelService.resetChannel();
    this.threadChatService.exitThread();
    const resp = await this.chatService.getChatWith(partner);
    if (!resp) {
      console.log('no chat created');
    }
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
    this.toggleDNone.toggleIsClassRemoved();
  }

  public searchContent(search: string): void {
    this.search = search;
    this.foundChannels = [];
    this.foundUsers = [];
    this.foundMessages = [];
    this.searchInChannels();
    this.firebaseService.users.forEach(user => {
      if (user.name.toLowerCase().includes(this.search.toLowerCase()) && this.search !== '') this.foundUsers.push(user);
    });
    if (this.search != '')
      this.searchMessagesInDirectChats();
  }

  searchInChannels() {
    this.channelService.userChannelsContent.forEach(channel => {
      if (channel.channel.name.toLowerCase().includes(this.search.toLowerCase()) && this.search !== '') {
        if (!this.foundChannels.find(el => el.id === channel.channel.id))
          this.foundChannels.push(channel.channel);
      }
      channel.messages.forEach(message => {
        const dom = new DOMParser().parseFromString(message.text, "text/html");
        const text = dom.documentElement.textContent;
        if (text && this.search !== '' && text.toLowerCase().includes(this.search.toLowerCase())) {
          if (!this.foundMessages.find(el => el.message.mid === message.mid)) {
            this.foundMessages.push({ user: this.firebaseService.getUser(message.uid)!, message: message, channel: channel.channel, chatId: undefined });
          }
        }
      });
    })
  }

  async searchMessagesInDirectChats() {
    if (!this.firebaseService.currentUser.directChatIds) {
      console.log('current user has no direct chats');
      return;
    }
    for (const chatId of this.firebaseService.currentUser.directChatIds) {
      const ref = this.firebaseService.getSingleChat(chatId);
      const messagesRef = collection(ref, 'messages');
      const snapshot = await getDocs(messagesRef);
      this.searchThroughMessages(chatId, snapshot);
    }
  }

  searchThroughMessages(chatId: string, snapshot: QuerySnapshot<DocumentData, DocumentData>) {
    snapshot.forEach((doc) => {
      const dom = new DOMParser().parseFromString(doc.data()['text'], "text/html");
      const text = dom.documentElement.textContent;
      if (text && this.search !== '' && text.toLowerCase().includes(this.search.toLowerCase()))
        if (!this.foundMessages.find(el => el.message.mid === doc.data()['mid']))
          this.foundMessages.push({
            user: this.firebaseService.getUser(doc.data()['uid'])!,
            message: doc.data() as Message,
            channel: undefined,
            chatId: chatId
          });
    });
  }

  public chooseFoundedChannel(channel: any): void {
    this.search = '';
    this.foundChannels = [];
    this.foundUsers = [];
    this.foundMessages = [];
    this.getAllUsersFromChannel(channel);
  }

  public chooseFoundedUser(user: any): void {
    this.search = '';
    this.foundChannels = [];
    this.foundUsers = [];
    this.foundMessages = [];
    this.openDirectChat(user);
  }

  async chooseFoundedMessage(message: { user: User, message: Message, channel?: Channel, chatId: string | undefined }) {
    this.search = '';
    this.foundChannels = [];
    this.foundUsers = [];
    this.foundMessages = [];
    if (message.channel) {
      this.getAllUsersFromChannel(message.channel)
    }
    else if (message.chatId) {
      await this.searchPartnerAndOpenChat(message.chatId);
    }
    this.scrollService.midToScroll.set(message.message.mid);
  }

  async searchPartnerAndOpenChat(chatId: string) {
    const chatRef = this.firebaseService.getSingleChat(chatId);
    const uidsData = await getDoc(chatRef);
    const uids = uidsData.data()!['uids'] as string[];
    uids.splice(uids.indexOf(this.firebaseService.currentUser.uid!), 1);
    let partner;
    if (uids.length === 0) partner = this.firebaseService.currentUser;
    else partner = this.firebaseService.getUser(uids[0]);
    if (partner)
      await this.openDirectChat(partner);
  }
}
