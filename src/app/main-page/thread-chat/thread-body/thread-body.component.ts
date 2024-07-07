import { Component, inject } from '@angular/core';
import { MessageComponent } from '../../active-chat/chat-body/message/message.component';
import { ThreadChatService } from '../../../services/chat/thread-chat/thread-chat.service';
import { Chat } from '../../../models/chat.class';

@Component({
  selector: 'app-thread-body',
  standalone: true,
  imports: [MessageComponent],
  templateUrl: './thread-body.component.html',
  styleUrl: './thread-body.component.scss'
})
export class ThreadBodyComponent {
  threadChatService = inject(ThreadChatService);
  chat!: Chat;

  ngOnInit() {
    if (this.threadChatService.chat) {
      this.chat = this.threadChatService.chat;
    }
  }

  ngOnChanges() {
    if (this.threadChatService.chat) {
      this.chat = this.threadChatService.chat;
    }
  }

  getChat() {
    return this.threadChatService.signalThreadChat();
  }
}
