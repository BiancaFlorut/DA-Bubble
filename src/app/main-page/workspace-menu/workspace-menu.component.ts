import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';
import { ChatService } from '../../services/chat/chat.service';
import { CreateChannelComponent } from './create-channel/create-channel.component';
import { CreateChannelService } from '../../services/create-channel/create-channel.service';
import { FirebaseChannelService } from '../../services/firebase-channel/firebase-channel.service';
import { ThreadChatService } from '../../services/chat/thread-chat/thread-chat.service';
import { Channel } from '../../interfaces/channel';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [
    CommonModule,
    CreateChannelComponent
  ],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent {
  firebaseService: FirebaseService = inject(FirebaseService);
  firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  chatService: ChatService = inject(ChatService);
  createChannelService: CreateChannelService = inject(CreateChannelService);
  threadChatService = inject(ThreadChatService);
  userService: UserService = inject(UserService);

  public userChannels: any[] = [];

  areChannelsMenuOpen: boolean = true;
  areDirectChatsMenuOpen: boolean = true;

  ngOnInit(): void {
    this.firebaseChannelService.channels$.subscribe(channels => {
      this.firebaseService.users$.subscribe(users => {
        this.processChannels(channels, users);
      });
    });
  }

  private processChannels(channels: Channel[], users: User[]): void {
    if (channels.length > 0) {
      this.userChannels = [];
      channels.forEach(channel => {
        users.forEach(user => {
          if (user.uid === this.userService.user.uid) {
            user.channelIds?.forEach(id => {
              if (id === channel.id) {
                if (!this.userChannels.includes(channel)) {
                  this.userChannels.push(channel);
                }
              }
            });
          }
        });
      });
    }
  }

  openChannelsMenu() {
    if (this.areChannelsMenuOpen) {
      this.areChannelsMenuOpen = false;
    } else {
      this.areChannelsMenuOpen = true;
    }
  }

  openDirectChatsMenu() {
    if (this.areDirectChatsMenuOpen) {
      this.areDirectChatsMenuOpen = false;
    } else {
      this.areDirectChatsMenuOpen = true;
    }
  }

  async openDirectChat(partner: User) {
    this.threadChatService.exitThread();
    await this.chatService.getChatWith(partner);
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
  }

  public async handleNewMessage() {
    this.chatService.newMessage = true;
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
  }

  async openCreateNewChannel() {
    this.createChannelService.toggleShowCreateChannel()
  }

  public getAllUsersFromChannel(channelId: string, channelName: string): void {
    this.firebaseChannelService.usersFromChannel = [];
    this.firebaseService.users.forEach(user => {
      user.channelIds?.forEach(async id => {
        if (id === channelId) {
          this.firebaseChannelService.usersFromChannel.push(user);
          this.firebaseChannelService.currentChannelName = channelName;
        }
      });
    });
    this.userService.currentChannel = channelId;
    this.createChannelService.showChannel = true;
    this.createChannelService.showCreateChannel = false;
    this.firebaseChannelService.openCreatedChannel = true;
  }

  openCreateNewChannel() {
    this.createChannelService.toggleShowCreateChannel()
  }
}
