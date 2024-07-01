import { Component, inject } from '@angular/core';
import { CreateChannelService } from '../../../services/create-channel/create-channel.service';
import { FormsModule } from '@angular/forms';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';

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
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  private userService: UserService = inject(UserService);

  public name: string = '';
  public description: string = '';
  public allUsers: boolean = false;
  public specificUsers: boolean = false;
  public isCreatedChannel: boolean = false;

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

  public handleRadioButton(button: string) {
    if (button === 'allUsers') {
      this.allUsers = true;
      this.specificUsers = false;
    } else {
      this.specificUsers = true;
      this.allUsers = false;
    }
  }
}
