import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat/chat.service';
import { DirectChat } from '../../../models/direct-chat.class';
import { FirebaseService } from '../../../services/firebase/firebase.service';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  message: string = '';
  chatService: ChatService = inject(ChatService);
  currentChat!: DirectChat;
  firebase: FirebaseService = inject(FirebaseService);
  @ViewChild('messageInput') messageInput!: ElementRef;

  constructor() { 
    this.chatService.currentChat.subscribe(chat  => {
      if (chat) {
        this.currentChat = chat;
        setTimeout(() => {
          this.messageInput.nativeElement.focus();
        }, 10)
      }
    });
  }

  sendMessage() {
    if (this.firebase.currentUser.uid) {
      console.log(this.currentChat);
      
      this.firebase.sendMessage(this.currentChat.cid, this.firebase.currentUser.uid, Date.now(), this.message);
      console.log(this.message);
    } else console.log('no user is logged in');
    this.message = '';
  }

}
