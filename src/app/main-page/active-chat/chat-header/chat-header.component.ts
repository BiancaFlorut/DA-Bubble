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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [
    CommonModule,
    AddPeopleComponent,
    MembersComponent,
    UpdateChannelComponent,
    FormsModule
  ],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  public firebaseService: FirebaseService = inject(FirebaseService);
  public chatService: ChatService = inject(ChatService);
  public showProfileService: ShowProfileService = inject(ShowProfileService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  public channelModalService: ChannelModalService = inject(ChannelModalService);
  private editUserProfileService: EditUserProfileService = inject(EditUserProfileService);

  private currentChat!: Chat;
  public partner: User | undefined;
  public user!: User;
  public directChat: boolean = false;
  searchToken: string = '';
  users: User[] = this.firebaseService.users;
  isSuggestedUserListOpen: boolean = false;
  selectedUsers: User[] = [];

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.currentChat = chat;
        const rest = this.currentChat.uids.filter(uid => uid !== this.firebaseService.currentUser.uid);
        if (rest.length === 0) {
          this.partner = this.firebaseService.currentUser;
        } else {
          this.partner = this.firebaseService.users.find(user => user.uid === rest[0]);
        }
        this.user = this.firebaseService.currentUser;
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

  public handleShowMembersAndShowAddPeople(): void {
    if (window.innerWidth <= 870) {
      this.channelModalService.showMembers = true;
    } else {
      this.channelModalService.toggleShowAddPeople();
    }
  }

  search(): void {
    if (this.searchToken.includes('@')) {
      this.isSuggestedUserListOpen = true;
      let token = this.searchToken.split('@');
      if (token[1].length === 0) {
        this.users = this.firebaseService.users;
      } else{
        this.users = [];
        this.firebaseService.users.forEach(user => {
          if (user.name.toLowerCase().includes(token[1].toLowerCase())) {
            this.users.push(user);
          }
        });
      }
    }
  }

  selectUser(user: User): void {
    if (this.selectedUsers.includes(user)) {
      this.selectedUsers.splice(this.selectedUsers.indexOf(user), 1);
    } else
    this.selectedUsers.push(user);
    console.log(this.selectedUsers);
    this.isSuggestedUserListOpen = false;
    this.searchToken = '';
  }

  closeSuggestedUserList(event: Event): void {
    event.stopPropagation();
    this.isSuggestedUserListOpen = false;
    this.searchToken = '';
  }
}