import { Component, inject } from '@angular/core';
import { ChannelModalService } from '../../../../services/channel-modal/channel-modal.service';
import { FirebaseChannelService } from '../../../../services/firebase-channel/firebase-channel.service';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../../services/firebase/firebase.service';
import { ChatService } from '../../../../services/chat/chat.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-update-channel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './update-channel.component.html',
  styleUrl: './update-channel.component.scss'
})
export class UpdateChannelComponent {
  public channelModalService: ChannelModalService = inject(ChannelModalService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  private firebaseService: FirebaseService = inject(FirebaseService);
  private chatService: ChatService = inject(ChatService);

  public updateChannelName: boolean = false;
  public updateChannelDescription: boolean = false;

  public name: string = '';
  public description: string = '';

  public toggleUpdateChannelName(name: string): void {
    if (this.updateChannelName) {
      this.updateChannel(name);
    }
    this.updateChannelName = !this.updateChannelName;
  }

  public toggleUpdateChannelDescription(name: string): void {
    if (this.updateChannelDescription) {
      this.updateChannel(name);
    }
    this.updateChannelDescription = !this.updateChannelDescription;
  }

  public updateChannel(name: string): void {
    if (name === 'name' && this.name !== '') {
      this.firebaseChannelService.channel.name = this.name;
    }
    if (name === 'description' && this.description !== '') {
      this.firebaseChannelService.channel.description = this.description;
    }
    this.firebaseChannelService.updateChannel(this.firebaseChannelService.channel.id);
  }

  public deleteUserFromChannel(): void {
    this.removeChannelFromUser();
    this.deleteChannelIfLastUser();
    this.resetChatAndCloseModals();
  }

  private removeChannelFromUser(): void {
    this.firebaseService.currentUser.channelIds?.forEach((channel, index) => {
      if (channel === this.firebaseChannelService.channel.id) {
        this.firebaseService.currentUser.channelIds?.splice(index, 1);
        this.firebaseService.updateUser(this.firebaseService.currentUser);
      }
    });
  }

  private deleteChannelIfLastUser(): void {
    if (this.firebaseChannelService.usersFromChannel.length === 1) {
      this.firebaseChannelService.channels.forEach((channel, index) => {
        if (channel.id === this.firebaseChannelService.channel.id) {
          this.firebaseChannelService.channels.splice(index, 1);
          this.firebaseChannelService.deleteChannel(this.firebaseChannelService.channel.id);
        }
      });
    }
  }

  private resetChatAndCloseModals(): void {
    this.chatService.newMessage = true;
    this.firebaseChannelService.openCreatedChannel = false;
    this.channelModalService.closeAllModals();
  }
}
