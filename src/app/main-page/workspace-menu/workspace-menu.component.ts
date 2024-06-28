import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';
import { ChatService } from '../../services/chat/chat.service';
import { CreateChannelComponent } from './create-channel/create-channel.component';
import { CreateChannelService } from '../../services/create-channel/create-channel.service';

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
  areChannelsMenuOpen: boolean = false;
  areDirectChatsMenuOpen: boolean = true;
  firebase: FirebaseService = inject(FirebaseService);
  chatService: ChatService = inject(ChatService);
  createChannelService: CreateChannelService = inject(CreateChannelService);

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
}
