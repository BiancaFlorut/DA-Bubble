import { Component, effect, inject } from '@angular/core';
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
  styleUrls: ['./chat-header.component.scss', './chat-header.component.media.scss']
})
export class ChatHeaderComponent {
  public firebaseService: FirebaseService = inject(FirebaseService);
  public chatService: ChatService = inject(ChatService);
  public showProfileService: ShowProfileService = inject(ShowProfileService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  public channelModalService: ChannelModalService = inject(ChannelModalService);
  private editUserProfileService: EditUserProfileService = inject(EditUserProfileService);
  public newMessageService = inject(NewMessageService);

  public actualChat: Chat | undefined = this.chatService.chat();
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

  /**
   * Sets up the chat header component by setting the actual chat,
   * partner, user and directChat variable.
   * Also sets the newMessage signal to false.
   * @private
   */
  constructor() {
    effect(() => {
      this.actualChat = this.chatService.chat();
      if (this.actualChat) {
        const rest = this.actualChat.uids.filter(uid => uid !== this.firebaseService.currentUser.uid);
        if (rest.length === 0) {
          this.partner = this.firebaseService.currentUser;
        } else {
          this.partner = this.firebaseService.users.find(user => user.uid === rest[0]);
        }
        this.user = this.firebaseService.currentUser;
        this.chatService.newMessage.set(false);
        this.directChat = true;
      }

    }, { allowSignalWrites: true });
  }

  /**
   * Toggles the showProfile flag of the editUserProfileService.
   * If the showProfile flag is true, it is set to false.
   * If the showProfile flag is false, all open modals are closed.
   * @param event the click event
   */
  public toggleShowProfile(event: Event): void {
    event.stopPropagation();
    if (this.editUserProfileService.showProfile) {
      this.editUserProfileService.showProfile = false;
    } else {
      this.channelModalService.closeAllModals();
    }
  }

  /**
   * Handles the showMembers and showAddPeople modals of the channelModalService.
   * If the window.innerWidth is less than or equal to 870, the showMembers flag is set to true.
   * Otherwise, the showAddPeople flag is toggled.
   */
  public handleShowMembersAndShowAddPeople(): void {
    if (window.innerWidth <= 870) {
      this.channelModalService.showMembers = true;
    } else {
      this.channelModalService.toggleShowAddPeople();
    }
  }

  /**
   * Handles the search input of the chat header.
   * If the search input contains '@', it searches for users.
   * If the search input contains '#', it searches for channels.
   * If the search input is empty, it closes the suggested user list.
   */
  search(): void {
    if (this.searchToken.includes('@'))
      this.searchForUsers();
    else if (this.searchToken.includes('#'))
      this.searchForChannels();
    else
      this.isSuggestedUserListOpen = false;
  }

  /**
   * Searches for users in the search input of the chat header.
   * If the search input contains '@' followed by a string, it searches for users with name containing that string.
   * If the search input contains '@' but no string, it shows all users.
   * If the search input is empty or there are no users found, it closes the suggested user list.
   */
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

  /**
   * Searches for channels in the search input of the chat header.
   * If the search input contains '#' followed by a string, it searches for channels with name containing that string.
   * If the search input contains '#' but no string, it shows all channels.
   * If the search input is empty or there are no channels found, it closes the suggested channel list.
   */
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

  /**
   * Selects a user from the user list and toggles the selectedUserChats signal of the newMessageService.
   * If the selectedUserChats signal already includes the user, it removes the user from the signal.
   * If the selectedUserChats signal does not include the user, it adds the user to the signal.
   * It then closes the suggested user list and resets the searchToken.
   * @param user The user to be selected.
   */
  selectUser(user: User): void {
    if (this.newMessageService.selectedUserChats().includes(user)) {
      this.newMessageService.selectedUserChats.update(users => {
        return users.filter(u => u.uid !== user.uid);
      });
    } else
      this.newMessageService.selectedUserChats.update(users => {
        return [...users, user];
      })
    this.isSuggestedUserListOpen = false;
    this.searchToken = '';
  }

  /**
   * Closes the suggested user list and resets the searchToken.
   * @param event The event that triggered this function.
   */
  closeSuggestedUserList(event: Event): void {
    event.stopPropagation();
    this.isSuggestedUserListOpen = false;
    this.searchToken = '';
  }

  /**
   * Selects a channel from the channel list and toggles the selectedChannels signal of the newMessageService.
   * If the selectedChannels signal already includes the channel, it removes the channel from the signal.
   * If the selectedChannels signal does not include the channel, it adds the channel to the signal.
   * It then closes the suggested channel list and resets the searchToken.
   * @param channel The channel to be selected.
   */
  selectChannel(channel: Channel): void {
    if (this.selectedChannels.includes(channel)) {
      this.selectedChannels.splice(this.selectedChannels.indexOf(channel), 1);
    } else
      this.selectedChannels.push(channel);
    this.newMessageService.selectedChannels.set(this.selectedChannels);
    this.isSuggestedChannelListOpen = false;
    this.searchToken = '';
  }

  /**
   * Closes the suggested channel list and resets the searchToken.
   * @param event The event that triggered this function.
   */
  closeSuggestedChannelList(event: Event): void {
    event.stopPropagation();
    this.isSuggestedChannelListOpen = false;
    this.searchToken = '';
  }
}