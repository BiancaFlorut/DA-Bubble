import { Component, inject } from '@angular/core';
import { SvgButtonComponent } from '../../svg-button/svg-button.component';
import { ThreadChatService } from '../../../services/chat/thread--chat/thread-chat.service';

@Component({
  selector: 'app-thread-chat-header',
  standalone: true,
  imports: [SvgButtonComponent],
  templateUrl: './thread-chat-header.component.html',
  styleUrl: './thread-chat-header.component.scss'
})
export class ThreadChatHeaderComponent {
  threadService = inject(ThreadChatService);
  exitThread() {
    console.log('exit thread');
    this.threadService.exitThread();
  }
}
