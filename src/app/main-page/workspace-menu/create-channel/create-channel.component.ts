import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CreateChannelService } from '../../../services/create-channel/create-channel.service';
import { FormsModule } from '@angular/forms';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { User } from '../../../interfaces/user';

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
  }

  public createChannel(event: Event): void {
    event.stopPropagation();
    this.firebaseChannelService.channel.name = this.name;
    this.firebaseChannelService.channel.description = this.description;
    this.firebaseChannelService.channel.creator = this.userService.user.name;
    this.firebaseChannelService.addNewChannel();
    this.name = '';
    this.description = '';
    this.showCreateChannel = false;
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

  public async saveCurrentChannelToUsers(): Promise<void> {
    let currentChannel = this.userService.currentChannel;
    if (this.allUsersChecked) {
      this.addCurrentChannelToUsers(currentChannel);
    } else {
      await this.addCurrentChannelToSelectedUsers(currentChannel);
      await this.firebaseChannelService.updateChannel(currentChannel);
    }
    this.createChannelService.showCreateChannel = false;
    this.firebaseChannelService.openCreatedChannel = true;
    this.showCreateChannel = true;
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
          user.channelIds?.push(currentChannel);
          this.firebaseService.updateUser(user);
        }
      });
    });
  }
}
