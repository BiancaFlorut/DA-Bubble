import { Component, inject } from '@angular/core';
import { ThreadChatHeaderComponent } from './thread-chat-header/thread-chat-header.component';
import { ThreadBodyComponent } from './thread-body/thread-body.component';
import { ChatInputComponent } from '../active-chat/chat-input/chat-input.component';
import { ThreadChatService } from '../../services/chat/thread-chat/thread-chat.service';

@Component({
  selector: 'app-thread-chat',
  standalone: true,
  imports: [ThreadChatHeaderComponent, ThreadBodyComponent, ChatInputComponent],
  templateUrl: './thread-chat.component.html',
  styleUrl: './thread-chat.component.scss'
})
export class ThreadChatComponent {

}