import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../../models/message.class';
import { SvgButtonComponent } from '../../../../svg-button/svg-button.component';
import { UserService } from '../../../../../services/user/user.service';
import { EmojiPickerButtonComponent } from '../emoji-picker-button/emoji-picker-button.component';
import { ThreadChatService } from '../../../../../services/chat/thread-chat/thread-chat.service';
import { ChatService } from '../../../../../services/chat/chat.service';
import { FirebaseChannelService } from '../../../../../services/firebase-channel/firebase-channel.service';
import { ToggleDNoneService } from '../../../../../services/toggle-d-none/toggle-d-none.service';

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
  public toggleDNone: ToggleDNoneService = inject(ToggleDNoneService);

  /**
   * Sorts the emojis in the UserService on component initialization.
   */
  constructor() {
    this.userService.sortEmojis();
  }

  /**
   * Toggles the message menu open/closed. If the menu is opened, it will be
   * closed after 2 seconds if no other action is taken.
   */
  toggleMessageMenu() {
    this.isMessageMenuOpen = !this.isMessageMenuOpen;
    if (this.isMessageMenuOpen) {
      setTimeout(() => {
        this.isMessageMenuOpen = false;
      }, 2000);
    }
  }

  /**
   * Emits an event to the parent component to open the message for editing
   * and closes the message menu if it is open.
   */
  editMessage() {
    this.editMessageEvent.emit();
    this.isMessageMenuOpen = false;
  }

  /**
   * Emits an event to the parent component to add a reaction to a message.
   * The id of the emoji to add is given as a parameter.
   * @param id The id of the emoji to add.
   */
  addReaction(id: string) {
    this.addReactionEvent.emit(id);
  }

  /**
   * Opens the thread chat for the message.
   * It sets the thread chat service's message to the current message and the chat to the current chat,
   * and then gets all messages of the chat and sets the thread chat service's openSideThread to true again.
   * Finally, it sets the is thread active flag to true.
   */
  openThread() {
    let chat = this.chatService.chat();
      this.threadService.openThreadChat(this.message, chat!);
      this.toggleDNone.toggleIsThreadActive();
  }

}
