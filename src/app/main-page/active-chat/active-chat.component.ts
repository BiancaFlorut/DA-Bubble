import { Component, computed, effect, inject, Signal } from '@angular/core';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { ChatBodyComponent } from './chat-body/chat-body.component';
import { ChatService } from '../../services/chat/chat.service';
import { Chat } from '../../models/chat.class';

@Component({
  selector: 'app-active-chat',
  standalone: true,
  imports: [ChatInputComponent, ChatHeaderComponent, ChatBodyComponent],
  templateUrl: './active-chat.component.html',
  styleUrl: './active-chat.component.scss'
})
export class ActiveChatComponent {
  chatService = inject(ChatService);
  chat: Signal<Chat | undefined> = computed(() => this.chatService.chat());

  constructor() {
  }

}