import { Component, Input, inject } from '@angular/core';
import { Emoji } from '../../../../../models/emoji.class';
import { Message } from '../../../../../models/message.class';
import { User } from '../../../../../interfaces/user';
import { ChatService } from '../../../../../services/chat/chat.service';

@Component({
  selector: 'app-emoji-counter',
  standalone: true,
  imports: [],
  templateUrl: './emoji-counter.component.html',
  styleUrl: './emoji-counter.component.scss'
})
export class EmojiCounterComponent {
  @Input({ required: true }) emoji!: Emoji;
  @Input({ required: true }) message!: Message;
  @Input({ required: true }) cid!: string;
  @Input({ required: true }) user!: User;
  chatService = inject(ChatService);


  incrementEmoji(id: string) {
    if (this.message.emojis) {
      const index = this.message.emojis.findIndex(e => e.id === id);
      if (index != -1) {
        if (!this.message.emojis[index].uids.includes(this.user.uid!)) {
          this.message.emojis[index].count++;
          this.message.emojis[index].uids.push(this.user.uid!);
        }
        else {
          this.message.emojis[index].count--;
          this.message.emojis[index].uids = this.message.emojis[index].uids.filter(uid => uid !== this.user.uid!);
        }
        this.chatService.editMessage(this.cid, this.message);
      }
    } else {
      console.log('no emojis');
    }

  }
}
