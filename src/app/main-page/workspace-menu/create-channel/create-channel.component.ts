import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CreateChannelService } from '../../../services/create-channel/create-channel.service';
import { FormsModule } from '@angular/forms';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { User } from '../../../interfaces/user';
import { ChatService } from '../../../services/chat/chat.service';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})
export class CreateChannelComponent {
  private createChannelService: CreateChannelService = inject(CreateChannelService);
  private firebaseService: FirebaseService = inject(FirebaseService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  private userService: UserService = inject(UserService);
  private chatService: ChatService = inject(ChatService);

  @ViewChild('specificUsers') specificUsers!: ElementRef<HTMLInputElement>;
  @ViewChild('allUsers') allUsers!: ElementRef<HTMLInputElement>;

  public filteredUsers: User[] = [];
  public selectedUsers: User[] = [];

  public name: string = '';
  public description: string = '';
  public searchUser: string = '';

  public specificUsersChecked: boolean = false;
  public allUsersChecked: boolean = true;
  public showCreateChannel: boolean = true;

  public toggleShowCreateChannel(event: Event): void {
    event.stopPropagation();
    this.createChannelService.toggleShowCreateChannel();
    this.showCreateChannel = true;
    this.createChannelService.showChannel = false;
    this.chatService.newMessage = true;
    this.firebaseChannelService.openCreatedChannel = false;
  }

  public createChannel(event: Event): void {
    event.stopPropagation();
    this.initializeAndAddChannel();
    this.filterUsersByCurrentChannel();
    this.updateCurrentChannelName();
    this.resetChannelForm();
  }

  private initializeAndAddChannel(): void {
    this.firebaseChannelService.channel.name = this.name;
    this.firebaseChannelService.channel.description = this.description;
    this.firebaseChannelService.channel.creator = this.firebaseService.currentUser.name;
    this.firebaseChannelService.addNewChannel();
  }

  private filterUsersByCurrentChannel(): void {
    this.firebaseService.users$.subscribe(users => {
      this.firebaseChannelService.usersFromChannel = [];
      users.forEach(user => {
        user.channelIds?.forEach(id => {
          if (id === this.userService.currentChannel) {
            this.firebaseChannelService.usersFromChannel.push(user);
          }
        });
      });
    });
  }

  private updateCurrentChannelName(): void {
    this.firebaseChannelService.channels$.subscribe(channels => {
      channels.forEach(channel => {
        if (this.userService.currentChannel === channel.id) {
          this.firebaseChannelService.currentChannelName = channel.name;
        }
      });
    });
  }

  private resetChannelForm(): void {
    this.name = '';
    this.description = '';
    this.showCreateChannel = false;
    this.createChannelService.showChannel = false;
  }

  public handleAllUsersRadioInput(): void {
    if (!this.allUsersChecked) {
      this.allUsersChecked = !this.allUsersChecked;
      this.specificUsersChecked = !this.specificUsersChecked;
    }
  }

  public handleSpecificUsersRadioInput(): void {
    if (!this.specificUsersChecked) {
      this.allUsersChecked = !this.allUsersChecked;
      this.specificUsersChecked = !this.specificUsersChecked;
    }
  }

  public filterSearchingUsers(): void {
    this.filteredUsers = [];
    this.filteredUsers = this.firebaseService.users.filter(user => {
      return user.name.toLowerCase().includes(this.searchUser.toLowerCase());
    });
    if (this.searchUser === '') {
      this.filteredUsers = [];
    }
  }

  public addUserToChannel(index: number): void {
    let selectedUser = this.filteredUsers[index];
    if (!this.selectedUsers.includes(selectedUser)) {
      this.selectedUsers.push(selectedUser);
    }
    this.searchUser = '';
  }

  public removeUserFromChannel(index: number): void {
    this.selectedUsers.splice(index, 1);
  }

  public saveCurrentChannelToUsers(): void {
    let currentChannel = this.userService.currentChannel;
    this.updateUsersChannelSubscription(currentChannel);
    this.loadUsersFromCurrentChannel(currentChannel);
    this.openCreatedChannel();
  }

  private updateUsersChannelSubscription(currentChannel: string): void {
    if (this.allUsersChecked) {
      this.addCurrentChannelToUsers(currentChannel);
    } else {
      this.addCurrentChannelToSelectedUsers(currentChannel);
      this.firebaseChannelService.updateChannel(currentChannel);
    }
  }

  private loadUsersFromCurrentChannel(currentChannel: string): void {
    this.firebaseService.users$.subscribe(users => {
      this.firebaseChannelService.usersFromChannel = [];
      users.forEach(user => {
        user.channelIds?.forEach(id => {
          if (id === currentChannel) {
            this.firebaseChannelService.usersFromChannel.push(user);
          }
        });
      });
    });
  }

  private addCurrentChannelToUsers(currentChannel: string): void {
    this.firebaseService.users.forEach(user => {
      if (!user.channelIds?.includes(currentChannel)) {
        user.channelIds?.push(currentChannel);
        this.firebaseService.updateUser(user);
      }
    });
  }

  private async addCurrentChannelToSelectedUsers(currentChannel: string): Promise<void> {
    this.firebaseService.users.forEach(user => {
      this.selectedUsers.forEach(selectedUser => {
        if (user === selectedUser) {
          if (!user.channelIds?.includes(currentChannel)) {
            user.channelIds?.push(currentChannel);
            this.firebaseService.updateUser(user);
            this.firebaseService.getUsers();
          }
        }
      });
    });
  }

  private openCreatedChannel(): void {
    this.createChannelService.showCreateChannel = false;
    this.showCreateChannel = true;
    this.firebaseChannelService.openCreatedChannel = true;
    this.createChannelService.showChannel = true;
  }
}
