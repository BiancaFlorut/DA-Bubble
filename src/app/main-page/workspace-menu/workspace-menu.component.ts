import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';
import { ChatService } from '../../services/chat/chat.service';
import { CreateChannelComponent } from './create-channel/create-channel.component';
import { CreateChannelService } from '../../services/create-channel/create-channel.service';
import { FirebaseChannelService } from '../../services/firebase-channel/firebase-channel.service';

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
  firebase: FirebaseService = inject(FirebaseService);
  firebaseChannel: FirebaseChannelService = inject(FirebaseChannelService);
  chatService: ChatService = inject(ChatService);
  createChannelService: CreateChannelService = inject(CreateChannelService);

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
    await this.chatService.setChatWith(partner);
  }

  public handleNewMessage() {
    this.chatService.newMessage = true;
  }
}
