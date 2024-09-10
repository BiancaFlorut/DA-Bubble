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
import { ToggleDNoneService } from '../../services/toggle-d-none/toggle-d-none.service';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [
    CommonModule,
    CreateChannelComponent,
    FormsModule
  ],
  templateUrl: './workspace-menu.component.html',
  styleUrls: ['./workspace-menu.component.scss', './workspace-menu.component.media.scss']
})
export class WorkspaceMenuComponent {
  public firebaseService: FirebaseService = inject(FirebaseService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  public chatService: ChatService = inject(ChatService);
  public createChannelService: CreateChannelService = inject(CreateChannelService);
  private threadChatService = inject(ThreadChatService);
  public userService: UserService = inject(UserService);
  private toggleDNone: ToggleDNoneService = inject(ToggleDNoneService);
  public searchService: SearchService = inject(SearchService);

  public areChannelsMenuOpen: boolean = true;
  public areDirectChatsMenuOpen: boolean = true;
  public search: string = '';

  /**
   * Toggles whether the channels menu is open or not.
   * If the channels menu is open, it will be closed.
   * If the channels menu is closed, it will be opened.
   */
  public openChannelsMenu(): void {
    if (this.areChannelsMenuOpen) {
      this.areChannelsMenuOpen = false;
    } else {
      this.areChannelsMenuOpen = true;
    }
  }

  /**
   * Toggles whether the direct chats menu is open or not.
   * If the direct chats menu is open, it will be closed.
   * If the direct chats menu is closed, it will be opened.
   */
  public openDirectChatsMenu(): void {
    if (this.areDirectChatsMenuOpen) {
      this.areDirectChatsMenuOpen = false;
    } else {
      this.areDirectChatsMenuOpen = true;
    }
  }

  /**
   * Opens a direct chat with the given user.
   * If the chat already exists, it will be opened.
   * If the chat doesn't exist, a new one will be created.
   * @param partner The user to open the direct chat with.
   * @returns A promise that resolves to true if the chat was found or created, false otherwise.
   */
  public async openDirectChat(partner: User): Promise<void> {
    this.chatService.closeChat();
    this.firebaseChannelService.resetChannel();
    this.threadChatService.exitThread();
    const resp = await this.chatService.getChatWith(partner);
    if (!resp) {
      console.log('no chat created');
    }
    this.firebaseChannelService.openCreatedChannel = false;
    this.createChannelService.showChannel = false;
    this.toggleDNone.toggleIsClassRemoved();
  }

  /**
   * Closes the current chat, sets newMessage to true, and toggles the isClassRemoved signal.
   * This is used when a user wants to start a new message.
   */
  public handleNewMessage(): void {
    this.chatService.closeChat();
    this.chatService.newMessage.set(true);
    this.firebaseChannelService.openCreatedChannel = false;
    this.firebaseChannelService.resetChannel();
    this.createChannelService.showChannel = false;
    this.toggleDNone.toggleIsClassRemoved();
  }

  /**
   * Toggles the visibility of the create channel menu.
   * When the menu is visible, the user can create a new channel.
   * When the menu is not visible, the user cannot create a new channel.
   */
  public openCreateNewChannel(): void {
    this.createChannelService.toggleShowCreateChannel();
  }

  /**
   * Closes the current chat, sets newMessage to false, and subscribes to the given channel.
   * Also updates the channel visibility and toggles the isClassRemoved signal.
   * This is used when a user wants to start a new message in a channel.
   * @param channel The channel to get all users from.
   */
  public getAllUsersFromChannel(channel: Channel): void {
    this.chatService.closeChat();
    this.threadChatService.exitThread();
    this.chatService.newMessage.set(false);
    this.filterUsersByChannel(channel);
    this.updateChannelVisibility(channel);
    this.firebaseChannelService.subscribeToMessages();
    this.toggleDNone.toggleIsClassRemoved();
  }

  /**
   * Filters the users from the given channel and stores them in the usersFromChannel array.
   * This is used when a user wants to see all users from a channel.
   * @param channel The channel from which to filter the users.
   */
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

  /**
   * Updates the channel visibility and toggles the isClassRemoved signal.
   * This is used when a user wants to start a new message in a channel.
   * @param channel The channel for which to update the visibility.
   */
  private updateChannelVisibility(channel: Channel): void {
    this.userService.currentChannel = channel.id;
    this.createChannelService.showChannel = true;
    this.createChannelService.showCreateChannel = false;
    this.firebaseChannelService.openCreatedChannel = true;
  }
}
