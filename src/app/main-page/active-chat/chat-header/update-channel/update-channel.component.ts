import { Component, inject } from '@angular/core';
import { ChannelModalService } from '../../../../services/channel-modal/channel-modal.service';
import { FirebaseChannelService } from '../../../../services/firebase-channel/firebase-channel.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-channel',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './update-channel.component.html',
  styleUrl: './update-channel.component.scss'
})
export class UpdateChannelComponent {
  public channelModalService: ChannelModalService = inject(ChannelModalService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);

  public updateChannelName: boolean = false;

  public toggleUpdateChannelName(): void {
    this.updateChannelName = !this.updateChannelName;
  }
}
