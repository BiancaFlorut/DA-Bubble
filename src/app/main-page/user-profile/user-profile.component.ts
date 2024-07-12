import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { ShowProfileService } from '../../services/show-profile/show-profile.service';
import { ChatService } from '../../services/chat/chat.service';
import { UserProfileService } from '../../services/user-profile/user-profile.service';
import { User } from '../../interfaces/user';
import { ChannelModalService } from '../../services/channel-modal/channel-modal.service';
import { FirebaseChannelService } from '../../services/firebase-channel/firebase-channel.service';
import { CreateChannelService } from '../../services/create-channel/create-channel.service';
import { ThreadChatService } from '../../services/chat/thread-chat/thread-chat.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  public userService: UserService = inject(UserService);
  public showProfileService: ShowProfileService = inject(ShowProfileService);
  public chatService: ChatService = inject(ChatService);
  private userProfileService: UserProfileService = inject(UserProfileService);
  private channelModalService: ChannelModalService = inject(ChannelModalService);
  private firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  private createChannelService: CreateChannelService = inject(CreateChannelService);
  private threadChatService: ThreadChatService = inject(ThreadChatService);

  public showDetails(): User {
    if (this.userProfileService.userDetails) {
      return this.userProfileService.userDetails;
    } else {
      return this.chatService.currentPartner;
    }
  }

  public toggleShowProfile(event: Event): void {
    event.stopPropagation();
    this.showProfileService.toggleShowProfile();
  }

  async openDirectChat() {
    this.showProfileService.toggleShowProfile();
    this.channelModalService.closeAllModals();
    this.threadChatService.exitThread();
    await this.chatService.getChatWith(this.showDetails());
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
  }
}
