import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';
import { ChatService } from '../../services/chat/chat.service';
import { CreateChannelComponent } from './create-channel/create-channel.component';
import { CreateChannelService } from '../../services/create-channel/create-channel.service';
import { FirebaseChannelService } from '../../services/firebase-channel/firebase-channel.service';
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
  userService: UserService = inject(UserService);

  areChannelsMenuOpen: boolean = false;
  areDirectChatsMenuOpen: boolean = true;

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
    await this.chatService.getChatWith(partner);
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
  }

  public handleNewMessage() {
    this.chatService.newMessage = true;
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
  }

  public getAllUsersFromChannel(channelId: string, channelName: string): void {
    this.firebaseChannelService.usersFromChannel = [];
    this.firebaseService.users.forEach(user => {
      user.channelIds?.forEach(id => {
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
}
