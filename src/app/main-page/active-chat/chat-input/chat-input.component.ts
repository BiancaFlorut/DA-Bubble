import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat/chat.service';
import { DirectChat } from '../../../models/direct-chat.class';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { AutosizeModule } from 'ngx-autosize';
import { Message } from '../../../models/message.class';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, CommonModule, AutosizeModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  message: string = '';
  chatService: ChatService = inject(ChatService);
  currentChat!: DirectChat;
  firebase: FirebaseService = inject(FirebaseService);
  @ViewChild('messageInput') messageInput!: ElementRef;
  placeholderText: string = 'Einen Nachricht schreiben...';

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.currentChat = chat;
        this.replacePlaceholder();
        setTimeout(() => {
          this.messageInput.nativeElement.focus();
        }, 10)
      }
    });
  }

  async sendMessage() {
    if (this.firebase.currentUser.uid) {
      const mid = await this.firebase.sendMessage(this.currentChat.cid, this.firebase.currentUser.uid, Date.now(), this.message);
      const message = new Message(mid.id, this.firebase.currentUser.uid, this.message, Date.now());
      this.firebase.updateMessage(this.currentChat.cid, mid.id, message);
    } else console.log('no user is logged in');
    this.message = '';
  }

  replacePlaceholder() {
    if (this.currentChat.user.uid === this.firebase.currentUser.uid) {
      if (this.currentChat.partner.uid === this.firebase.currentUser.uid) {
        this.placeholderText = `Nachricht an dir`;
      } else
        this.placeholderText = `Nachricht an ${this.currentChat.partner.name}`
    } else {
      this.placeholderText = `Nachricht von ${this.currentChat.user.name}`
    }
  }

}
