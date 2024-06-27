import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { ShowProfileService } from '../../services/show-profile/show-profile.service';
import { ChatService } from '../../services/chat/chat.service';

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

  public toggleShowProfile(event: Event): void {
    event.stopPropagation();
    this.showProfileService.toggleShowProfile();
  }

  async openDirectChat() {
    this.showProfileService.toggleShowProfile();
    await this.chatService.setChatWith(this.chatService.currentPartner);
  }
}
