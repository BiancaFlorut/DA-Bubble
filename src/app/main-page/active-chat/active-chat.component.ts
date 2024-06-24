import { Component } from '@angular/core';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ChatHeaderComponent } from './chat-header/chat-header.component';

@Component({
  selector: 'app-active-chat',
  standalone: true,
  imports: [ChatInputComponent, ChatHeaderComponent],
  templateUrl: './active-chat.component.html',
  styleUrl: './active-chat.component.scss'
})
export class ActiveChatComponent {

}
