import { Component, inject } from '@angular/core';
import { ChannelModalService } from '../../../../services/channel-modal/channel-modal.service';
import { FirebaseChannelService } from '../../../../services/firebase-channel/firebase-channel.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../../interfaces/user';
import { FirebaseService } from '../../../../services/firebase/firebase.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user/user.service';

@Component({
  selector: 'app-channel-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './channel-modal.component.html',
  styleUrl: './channel-modal.component.scss'
})
export class ChannelModalComponent {
  public channelModalService: ChannelModalService = inject(ChannelModalService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  public firebaseService: FirebaseService = inject(FirebaseService);
  public userService: UserService = inject(UserService);

  public filteredUsers: User[] = [];
  public selectedUsers: User[] = [];

  public searchUser: string = '';

  public toggleChannelModal(): void {
    this.channelModalService.toggleShowModal();
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

  public async saveCurrentChannelToUsers(): Promise<void> {
    let currentChannel = this.userService.currentChannel;
    await this.addCurrentChannelToSelectedUsers(currentChannel);
    this.firebaseChannelService.channels.forEach(channel => {
      if (channel.id === currentChannel) {
        this.firebaseChannelService.channel = channel;
      }
    });
    await this.firebaseChannelService.updateChannel(currentChannel);
    this.firebaseChannelService.usersFromChannel = [];
    this.firebaseService.users.forEach(user => {
      user.channelIds?.forEach(id => {
        if (id === currentChannel) {
          this.firebaseChannelService.usersFromChannel.push(user);
        }
      });
    });
    this.channelModalService.toggleShowModal();
  }

  private async addCurrentChannelToSelectedUsers(currentChannel: string): Promise<void> {
    this.firebaseService.users.forEach(user => {
      this.selectedUsers.forEach(selectedUser => {
        if (user === selectedUser) {
          if (!user.channelIds?.includes(currentChannel)) {
            user.channelIds?.push(currentChannel);
            this.firebaseService.updateUser(user);
          }
        }
      });
    });
  }
}