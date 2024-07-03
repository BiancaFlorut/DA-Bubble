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
  public createChannelService: CreateChannelService = inject(CreateChannelService);
  public firebaseService: FirebaseService = inject(FirebaseService);
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

  public createChannel(event: Event) {
    event.stopPropagation();
    this.firebaseChannelService.channel.name = this.name;
    this.firebaseChannelService.channel.description = this.description;
    this.firebaseChannelService.channel.creator = this.userService.user.name;
    this.firebaseChannelService.addNewChannel();
    this.name = '';
    this.description = '';
    this.showCreateChannel = false;
  }

  public handleAllUsersRadioInput() {
    if (!this.allUsersChecked) {
      this.allUsersChecked = !this.allUsersChecked;
      this.specificUsersChecked = !this.specificUsersChecked;
    }
  }

  public handleSpecificUsersRadioInput() {
    if (!this.specificUsersChecked) {
      this.allUsersChecked = !this.allUsersChecked;
      this.specificUsersChecked = !this.specificUsersChecked;
    }
  }

  public filterSearchingUsers() {
    this.filteredUsers = [];
    this.filteredUsers = this.firebaseService.users.filter(user => {
      return user.name.toLowerCase().includes(this.searchUser.toLowerCase());
    });
    if (this.searchUser === '') {
      this.filteredUsers = [];
    }
  }

  public addUserToChannel(index: number) {
    let selectedUser = this.filteredUsers[index];
    if (!this.selectedUsers.includes(selectedUser)) {
      this.selectedUsers.push(selectedUser);
    }
    this.searchUser = '';
  }

  public removeUserFromChannel(index: number) {
    this.selectedUsers.splice(index, 1);
  }

  public saveUserToChannel() {
    let currentChannel = this.userService.currentChannel;
    if (this.allUsersChecked) {
      this.firebaseService.users.forEach(user => {
        if (!user.channelIds?.includes(currentChannel)) {
          user.channelIds?.push(currentChannel);
          this.firebaseService.updateUser(user);
        }
      });
    } else {
      this.firebaseChannelService.updateChannel(currentChannel);
    }
    this.createChannelService.showCreateChannel = false;
    this.showCreateChannel = true;
  }
}
