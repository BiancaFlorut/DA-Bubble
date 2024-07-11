import { Component, inject } from '@angular/core';
import { MessageComponent } from '../../active-chat/chat-body/message/message.component';
import { ThreadChatService } from '../../../services/chat/thread-chat/thread-chat.service';
import { Message } from '../../../models/message.class';

@Component({
  selector: 'app-thread-body',
  standalone: true,
  imports: [MessageComponent],
  templateUrl: './thread-body.component.html',
  styleUrl: './thread-body.component.scss'
})
export class ThreadBodyComponent {
  threadChatService = inject(ThreadChatService);
  messages: Message[] = [];

  constructor() { 

  }
}
