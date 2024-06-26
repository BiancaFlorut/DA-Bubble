import { Component, ViewChild, viewChild } from '@angular/core';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ChatHeaderComponent } from './chat-header/chat-header.component';
import { ChatBodyComponent } from './chat-body/chat-body.component';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-active-chat',
  standalone: true,
  imports: [ChatInputComponent, ChatHeaderComponent, ChatBodyComponent],
  templateUrl: './active-chat.component.html',
  styleUrl: './active-chat.component.scss'
})
export class ActiveChatComponent {
}
