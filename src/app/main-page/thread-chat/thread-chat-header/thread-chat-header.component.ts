import { Component, inject } from '@angular/core';
import { SvgButtonComponent } from '../../svg-button/svg-button.component';
import { ThreadChatService } from '../../../services/chat/thread-chat/thread-chat.service';
import { ToggleDNoneService } from '../../../services/toggle-d-none/toggle-d-none.service';

@Component({
  selector: 'app-thread-chat-header',
  standalone: true,
  imports: [SvgButtonComponent],
  templateUrl: './thread-chat-header.component.html',
  styleUrl: './thread-chat-header.component.scss'
})
export class ThreadChatHeaderComponent {
  threadService = inject(ThreadChatService);
  public toggleDNone: ToggleDNoneService = inject(ToggleDNoneService);

  exitThread() {
    this.threadService.exitThread();
    this.toggleDNone.toggleIsThreadActive();
  }
}
