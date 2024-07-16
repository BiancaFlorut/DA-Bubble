import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../../models/message.class';
import { SvgButtonComponent } from '../../../../svg-button/svg-button.component';
import { UserService } from '../../../../../services/user/user.service';
import { EmojiPickerButtonComponent } from '../emoji-picker-button/emoji-picker-button.component';
import { ThreadChatService } from '../../../../../services/chat/thread-chat/thread-chat.service';
import { ChatService } from '../../../../../services/chat/chat.service';
import { FirebaseChannelService } from '../../../../../services/firebase-channel/firebase-channel.service';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [SvgButtonComponent, EmojiPickerButtonComponent],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent {

  @Input() editable: boolean = false;
  @Input() message!: Message;
  @Output() editMessageEvent = new EventEmitter<Message>();
  @Output() addReactionEvent = new EventEmitter<string>();
  isMessageMenuOpen: boolean = false;
  @ViewChild('messageMenu') messageMenu!: ElementRef;
  userService = inject(UserService);
  threadService = inject(ThreadChatService);
  chatService = inject(ChatService);
  channelService = inject(FirebaseChannelService);

  constructor() {
    this.userService.sortEmojis();
  }

  toggleMessageMenu() {
    this.isMessageMenuOpen = !this.isMessageMenuOpen;
    if (this.isMessageMenuOpen) {
      setTimeout(() => {
        this.isMessageMenuOpen = false;
      }, 2000);
    }
  }

  editMessage() {
    this.editMessageEvent.emit();
    this.isMessageMenuOpen = false;
  }

  addReaction(id: string) {
    this.addReactionEvent.emit(id);
  }

  openThread() {
    this.threadService.openThreadChat(this.message, this.chatService.chat!);
  }

}
