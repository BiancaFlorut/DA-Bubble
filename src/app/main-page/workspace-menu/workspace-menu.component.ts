import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';
import { ChatService } from '../../services/chat/chat.service';
import { CreateChannelComponent } from './create-channel/create-channel.component';
import { CreateChannelService } from '../../services/create-channel/create-channel.service';
import { FirebaseChannelService } from '../../services/firebase-channel/firebase-channel.service';
import { ThreadChatService } from '../../services/chat/thread-chat/thread-chat.service';
import { UserService } from '../../services/user/user.service';
import { Channel } from '../../interfaces/channel';

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
  public firebaseService: FirebaseService = inject(FirebaseService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  public chatService: ChatService = inject(ChatService);
  public createChannelService: CreateChannelService = inject(CreateChannelService);
  private threadChatService = inject(ThreadChatService);
  public userService: UserService = inject(UserService);

  public areChannelsMenuOpen: boolean = true;
  public areDirectChatsMenuOpen: boolean = true;

  public openChannelsMenu(): void {
    if (this.areChannelsMenuOpen) {
      this.areChannelsMenuOpen = false;
    } else {
      this.areChannelsMenuOpen = true;
    }
  }

  public openDirectChatsMenu(): void {
    if (this.areDirectChatsMenuOpen) {
      this.areDirectChatsMenuOpen = false;
    } else {
      this.areDirectChatsMenuOpen = true;
    }
  }

  public async openDirectChat(partner: User): Promise<void> {
    this.threadChatService.exitThread();
    const resp = await this.chatService.getChatWith(partner);
    if (!resp) {
      console.log('no chat created');
      
    }
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
  }

  public handleNewMessage(): void {
    this.chatService.newMessage = true;
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
  }

  public openCreateNewChannel(): void {
    this.createChannelService.toggleShowCreateChannel()
  }

  public getAllUsersFromChannel(channel: Channel): void {
    this.filterUsersByChannel(channel);
    this.updateChannelVisibility(channel);
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
}
