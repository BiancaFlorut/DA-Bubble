import { Component, inject } from '@angular/core';
import { User } from '../../../interfaces/user';
import { ChatService } from '../../../services/chat/chat.service';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { Chat } from '../../../models/chat.class';
import { ShowProfileService } from '../../../services/show-profile/show-profile.service';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';
import { ChannelModalService } from '../../../services/channel-modal/channel-modal.service';
import { AddPeopleComponent } from './add-people/add-people.component';
import { MembersComponent } from './members/members.component';
import { EditUserProfileService } from '../../../services/edit-user-profile/edit-user-profile.service';
import { UpdateChannelComponent } from './update-channel/update-channel.component';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [
    CommonModule,
    AddPeopleComponent,
    MembersComponent,
    UpdateChannelComponent
  ],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  firebase: FirebaseService = inject(FirebaseService);
  chatService: ChatService = inject(ChatService);
  public showProfileService = inject(ShowProfileService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  public channelModalService: ChannelModalService = inject(ChannelModalService);
  private editUserProfileService: EditUserProfileService = inject(EditUserProfileService);

  currentChat!: Chat;
  partner: User | undefined;
  user!: User;
  directChat: boolean = false;
  channelChat: boolean = false;

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.currentChat = chat;
        const rest = this.currentChat.uids.filter(uid => uid !== this.firebase.currentUser.uid);
        if (rest.length === 0) {
          this.partner = this.firebase.currentUser;
        } else {
          this.partner = this.firebase.users.find(user => user.uid === rest[0]);
        }
        this.user = this.firebase.currentUser;
        this.chatService.newMessage = false;
        this.directChat = true;
      }
    });
  }

  public toggleShowProfile(event: Event): void {
    event.stopPropagation();
    if (this.editUserProfileService.showProfile) {
      this.editUserProfileService.showProfile = false;
    } else {
      this.channelModalService.closeAllModals();
    }
  }
}