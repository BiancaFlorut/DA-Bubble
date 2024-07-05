import { Component, Input, inject } from '@angular/core';
import { User } from '../../../interfaces/user';
import { ChatService } from '../../../services/chat/chat.service';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { Chat } from '../../../models/chat.class';
import { ShowProfileService } from '../../../services/show-profile/show-profile.service';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  firebase: FirebaseService = inject(FirebaseService);
  chatService: ChatService = inject(ChatService);
  public showProfileService = inject(ShowProfileService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);

  currentChat!: Chat;
  partner: User | undefined;
  user!: User;
  directChat: boolean = false;
  channelChat: boolean = false;

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.currentChat = chat;
        this.currentChat.uids.forEach(uid => {
          if (uid !== this.firebase.currentUser.uid) {
            this.partner = this.firebase.getUser(uid);
          } 
          
        });
        this.user = this.firebase.currentUser;
        this.chatService.newMessage = false;
        this.directChat = true;
      }
    });
  }

  // getPartner(): User | null {
  //   if (this.currentChat) {
  //     if (this.currentChat.user.uid === this.firebase.currentUser.uid) {
  //       return this.currentChat.partner;
  //     } else {
  //       return this.currentChat.user;
  //     }
  //   }
  //   return null;
  // }
}
