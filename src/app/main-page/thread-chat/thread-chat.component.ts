import { Component } from '@angular/core';
import { ThreadChatHeaderComponent } from './thread-chat-header/thread-chat-header.component';
import { ThreadBodyComponent } from './thread-body/thread-body.component';
import { ThreadInputComponent } from './thread-input/thread-input.component';

@Component({
  selector: 'app-thread-chat',
  standalone: true,
  imports: [ThreadChatHeaderComponent, ThreadBodyComponent, ThreadInputComponent],
  templateUrl: './thread-chat.component.html',
  styleUrl: './thread-chat.component.scss'
})
export class ThreadChatComponent {

}
