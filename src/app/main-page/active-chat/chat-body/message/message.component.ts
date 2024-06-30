import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../models/message.class';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { ShowProfileService } from '../../../../services/show-profile/show-profile.service';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../services/chat/chat.service';
import { User } from '../../../../interfaces/user';
import { EditableMessageComponent } from './editable-message/editable-message.component';
import { DirectChat } from '../../../../models/direct-chat.class';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [ReactionBarComponent, CommonModule, EditableMessageComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() user!: User;
  @Input() partner!: User;
  isEditing: boolean = false;
  public showProfileService: ShowProfileService = inject(ShowProfileService);
  chatService = inject(ChatService);
  chat!: DirectChat;

  constructor() { 
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.chat = chat;
      }
    })
  }

  editMessage() {
    console.log(this.message);
    this.isEditing = true;
    // this.chatService.editMessage(message);
  }

  closeEdit(message: Message) {
    this.isEditing = false;
    if (message) {    
      this.chatService.editMessage(this.chat.cid, message);
    } else
      console.log('message is null');
  }
}
