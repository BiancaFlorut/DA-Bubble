import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelModalService } from '../../../../services/channel-modal/channel-modal.service';
import { FirebaseChannelService } from '../../../../services/firebase-channel/firebase-channel.service';
import { FirebaseService } from '../../../../services/firebase/firebase.service';
import { UserService } from '../../../../services/user/user.service';
import { User } from '../../../../interfaces/user';

@Component({
  selector: 'app-add-people',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './add-people.component.html',
  styleUrl: './add-people.component.scss'
})
export class AddPeopleComponent {
  public channelModalService: ChannelModalService = inject(ChannelModalService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  public firebaseService: FirebaseService = inject(FirebaseService);
  public userService: UserService = inject(UserService);

  public filteredUsers: User[] = [];
  public selectedUsers: User[] = [];

  public searchUser: string = '';

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

  public handleOpenOrCloseModal(): void {
    this.channelModalService.toggleShowAddPeople();
    if (this.channelModalService.showMembers) {
      this.channelModalService.toggleShowMembers();
    }
  }

  public async saveCurrentChannelToUsers(): Promise<void> {
    let currentChannel = this.userService.currentChannel;
    await this.updateUsersChannel(currentChannel);
    await this.updateChannel(currentChannel);
    this.channelModalService.toggleShowAddPeople();
  }

  private async updateUsersChannel(currentChannel: string): Promise<void> {
    await this.addCurrentChannelToSelectedUsers(currentChannel);
    this.firebaseChannelService.channels.forEach(channel => {
      if (channel.id === currentChannel) {
        this.firebaseChannelService.channel = channel;
      }
    });
  }

  private async updateChannel(currentChannel: string): Promise<void> {
    await this.firebaseChannelService.updateChannel(currentChannel);
    this.firebaseChannelService.usersFromChannel = [];
    this.firebaseService.users.forEach(user => {
      user.channelIds?.forEach(id => {
        if (id === currentChannel) {
          this.firebaseChannelService.usersFromChannel.push(user);
        }
      });
    });
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
