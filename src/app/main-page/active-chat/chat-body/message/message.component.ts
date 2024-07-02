import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../models/message.class';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { ShowProfileService } from '../../../../services/show-profile/show-profile.service';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../services/chat/chat.service';
import { User } from '../../../../interfaces/user';
import { EditableMessageComponent } from './editable-message/editable-message.component';
import { DirectChat } from '../../../../models/direct-chat.class';
import { EmojiCounterComponent } from '../../message/emoji-counter/emoji-counter.component';
import { EmojiPickerButtonComponent } from './emoji-picker-button/emoji-picker-button.component';
import { UserService } from '../../../../services/user/user.service';
import { Emoji } from '../../../../models/emoji.class';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [ReactionBarComponent, CommonModule, EditableMessageComponent, EmojiCounterComponent, EmojiPickerButtonComponent],
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
  userService = inject(UserService);
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

  addReaction(id: string) {
    const indexUser = this.userService.emojis.findIndex(e => e.id === id);
    if (indexUser != -1) {
      this.userService.emojis[indexUser].count++;
      const index = this.message.emojis.findIndex(e => e.id === id);
      if (index != -1) {
        if (!this.message.emojis[index].uids.includes(this.userService.firebase.currentUser.uid!))
        this.message.emojis[index].count++;
        this.message.emojis[index].uids.push(this.userService.firebase.currentUser.uid!);
      } else {
        const emoji = new Emoji(id,this.userService.emojis[indexUser].path, this.userService.firebase.currentUser.uid!);
        emoji.count = 1;
        this.message.emojis.push(emoji);
      }
      this.userService.sortEmojis();
      this.editMessage(this.message);
    } else {
      console.log('no emoji found in user service');
    }
  }

  isCurrentUser(uid: string) {
    return uid === this.userService.firebase.currentUser.uid;
  }
}
