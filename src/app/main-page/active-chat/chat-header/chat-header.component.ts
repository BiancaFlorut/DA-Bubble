import { Component, Input, inject } from '@angular/core';
import { User } from '../../../interfaces/user';
import { ChatService } from '../../../services/chat/chat.service';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { DirectChat } from '../../../models/direct-chat.class';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.scss'
})
export class ChatHeaderComponent {
  newMessage: boolean = true;
  directChat: boolean = false;
  channelChat: boolean = false;
  firebase: FirebaseService = inject(FirebaseService);
  chatService: ChatService = inject(ChatService);
  currentChat!: DirectChat;
  partner: User | null = null;
  loading: boolean = false;
  constructor() { 
    this.chatService.currentChat.subscribe(chat  => {
      if (chat) {
        this.currentChat = chat;
        this.partner = this.getPartner();
        this.newMessage = false;
        this.directChat = true;
      }
    });
  }

  getPartner(): User | null {
    if (this.currentChat) {     
      if (this.currentChat.user.uid === this.firebase.currentUser.uid) {
        return this.currentChat.partner;
      } else {
        return this.currentChat.user;
      }
    }
    return null;
  }
}
