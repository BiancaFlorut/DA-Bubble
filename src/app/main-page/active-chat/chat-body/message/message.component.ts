import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../models/message.class';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { ShowProfileService } from '../../../../services/show-profile/show-profile.service';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../services/chat/chat.service';
import { User } from '../../../../interfaces/user';
import { EditableMessageComponent } from './editable-message/editable-message.component';
import { DirectChat } from '../../../../models/direct-chat.class';
import { EmojiCounterComponent } from './emoji-counter/emoji-counter.component';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [ReactionBarComponent, CommonModule, EditableMessageComponent, EmojiCounterComponent],
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
  @Input() cid: string = '';
  @ViewChild('messageItem') messageItem!: ElementRef;

  constructor() {

  }

  editMessage(message: Message) {
    if (message) {
      this.isEditing = false;
      this.chatService.editMessage(this.cid, message);
    }
    else
      this.isEditing = true;
  }


  closeEdit(message: Message) {
    this.isEditing = false;
    if (message)
      this.chatService.editMessage(this.cid, message);
  }

  scrollIntoView() {
    this.messageItem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  
}
