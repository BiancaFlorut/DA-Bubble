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
  public name: string = '';
  public description: string = '';
  public searchUser: string = '';
  public isCreatedChannel: boolean = false;
  specificUsersChecked: boolean = false;
  allUsersChecked: boolean = true;

  public toggleShowCreateChannel(event: Event): void {
    event.stopPropagation();
    this.firebaseChannelService.channel.name = '';
    this.createChannelService.toggleShowCreateChannel();
  }

  public createChannel(event: Event): void {
    event.stopPropagation();
    this.firebaseChannelService.channel.name = this.name;
    this.firebaseChannelService.channel.description = this.description;
    this.firebaseChannelService.channel.creator = this.userService.user.name;
    this.firebaseChannelService.addNewChannel();
    this.name = '';
    this.description = '';
    this.isCreatedChannel = true;
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

  public addUsersToChannel() {
    console.log('user add');
  }
}
