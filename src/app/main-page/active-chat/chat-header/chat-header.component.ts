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
import { Channel } from '../../../interfaces/channel';
import { NewMessageService } from '../../../services/new-message/new-message.service';

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
  public newMessageService = inject(NewMessageService);

  private currentChat!: Chat;
  public partner: User | undefined;
  public user!: User;
  public directChat: boolean = false;
  searchToken: string = '';
  users: User[] = this.firebaseService.users;
  channelList: Channel[] = this.firebaseChannelService.userChannels;
  selectedChannels: Channel[] = [];
  isSuggestedUserListOpen: boolean = false;
  isSuggestedChannelListOpen: boolean = false;
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
    if (this.searchToken.includes('@'))
      this.searchForUsers();
    else if (this.searchToken.includes('#'))
      this.searchForChannels();
    else  
      this.isSuggestedUserListOpen = false;
  }

  searchForUsers(): void {
    let token = this.searchToken.split('@');
    if (token[1].length === 0) {
      this.users = this.firebaseService.users;
    } else {
      this.users = [];
      this.firebaseService.users.forEach(user => {
        if (user.name.toLowerCase().includes(token[1].toLowerCase())) {
          this.users.push(user);
        }
      });
    }
    if (this.users.length === 0 || this.searchToken.length === 0) this.isSuggestedUserListOpen = false;
      else this.isSuggestedUserListOpen = true;
  }

  searchForChannels(): void {
    let token = this.searchToken.split('#');
    if (token[1].length === 0) {
      this.channelList = this.firebaseChannelService.userChannels;
    } else {
      this.channelList = [];
      this.firebaseChannelService.userChannels.forEach(channel => {
        if (channel.name.toLowerCase().includes(token[1].toLowerCase())) {
          this.channelList.push(channel);
        }
      });
    }
    if (this.channelList.length === 0 || this.searchToken.length === 0) this.isSuggestedChannelListOpen = false;
      else this.isSuggestedChannelListOpen = true;
  }

  selectUser(user: User): void {
    if (this.newMessageService.selectedUserChats().includes(user)) {
      this.newMessageService.selectedUserChats.update( users => {
        return users.filter(u => u.uid !== user.uid);
      });
    } else
    this.newMessageService.selectedUserChats.update( users => {
      return [...users, user];
    })
    this.isSuggestedUserListOpen = false;
    this.searchToken = '';
  }

  closeSuggestedUserList(event: Event): void {
    event.stopPropagation();
    this.isSuggestedUserListOpen = false;
    this.searchToken = '';
  }

  selectChannel(channel: Channel): void {
    if (this.selectedChannels.includes(channel)) {
      this.selectedChannels.splice(this.selectedChannels.indexOf(channel), 1);
    } else
      this.selectedChannels.push(channel);
    this.newMessageService.selectedChannels.set(this.selectedChannels);
    this.isSuggestedChannelListOpen = false;
    this.searchToken = '';
  }

  closeSuggestedChannelList(event: Event): void {
    event.stopPropagation();
    this.isSuggestedChannelListOpen = false;
    this.searchToken = '';
  }
}