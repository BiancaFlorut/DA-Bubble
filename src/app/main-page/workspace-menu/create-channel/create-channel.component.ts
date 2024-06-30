import { Component, inject } from '@angular/core';
import { CreateChannelService } from '../../../services/create-channel/create-channel.service';
import { FormsModule } from '@angular/forms';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})
export class CreateChannelComponent {
  public createChannelService: CreateChannelService = inject(CreateChannelService);
  private firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  private userService: UserService = inject(UserService);

  public name!: string;
  public description!: string;

  public toggleShowCreateChannel(event: Event): void {
    event.stopPropagation();
    this.createChannelService.toggleShowCreateChannel();
  }

  public createChannel(): void {
    this.firebaseChannelService.channel.name = this.name;
    this.firebaseChannelService.channel.description = this.description;
    this.firebaseChannelService.channel.creator = this.userService.user.name;
    this.firebaseChannelService.addNewChannel();
    this.name = '';
    this.description = '';
  }
}
