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

  public getAllUsersFromChannel(channel: Channel): void {
    this.chatService.closeChat();
    this.threadChatService.exitThread();
    this.chatService.newMessage = false;
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
}
