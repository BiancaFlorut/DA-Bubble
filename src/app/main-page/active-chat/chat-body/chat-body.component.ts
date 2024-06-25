import { Component, inject } from '@angular/core';
import { ChatService } from '../../../services/chat/chat.service';
import { DirectChat } from '../../../models/direct-chat.class';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-body',
  standalone: true,
  imports: [DatePipe ],
  templateUrl: './chat-body.component.html',
  styleUrl: './chat-body.component.scss'
})
export class ChatBodyComponent {
  chatService = inject(ChatService);
  chat!: DirectChat;

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.chat = chat;
        this.chat.messages = chat.messages.sort((a, b) => a.timestamp - b.timestamp);

        console.log(this.chat);
        
      }
    })
  }
}