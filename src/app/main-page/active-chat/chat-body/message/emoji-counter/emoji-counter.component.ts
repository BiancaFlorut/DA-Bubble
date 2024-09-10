import { Component, Input, inject } from '@angular/core';
import { Emoji } from '../../../../../models/emoji.class';
import { Message } from '../../../../../models/message.class';
import { ChatService } from '../../../../../services/chat/chat.service';
import { ThreadChatService } from '../../../../../services/chat/thread-chat/thread-chat.service';
import { FirebaseService } from '../../../../../services/firebase/firebase.service';
import { FirebaseChannelService } from '../../../../../services/firebase-channel/firebase-channel.service';

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
  firebase = inject(FirebaseService);
  chatService = inject(ChatService);
  threadService = inject(ThreadChatService);
  user = this.firebase.currentUser;
  channelService = inject(FirebaseChannelService);

  /**
   * Increments the count of the emoji with the given id in the message's emojis.
   * If the emoji is not found in the list of available emojis, it is added with a count of 1.
   * If the emoji is already in the list of available emojis, its count is incremented.
   * The user service is then updated to reflect the change.
   * The message is then edited with the new emoji.
   * @param id The id of the emoji to add.
   */
  async incrementEmoji(id: string) {
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
        if (this.message.isAnswer)
          await this.threadService.editMessage(this.message, this.cid);
        else if (this.channelService.isChannelSet())
          await this.channelService.editMessage(this.message);
        else
        await this.chatService.editMessage(this.cid, this.message);
      }
    } else {
      console.log('no emojis');
    }

  }

  /**
   * Returns a string that describes who reacted with the emoji.
   * If there is only one person, it returns 'Du hast reagiert.' if the user is the one who reacted, or 'X hat reagiert.' if it is someone else.
   * If there are two people, it returns 'X und Y haben reagiert.'
   * If there are three people, it returns 'X, Y und Z haben reagiert.'
   * If there are more than three people, it returns 'X, Y und [number] weitere haben reagiert.'
   * If there are no people, it returns an empty string.
   * @returns string
   */
  getDetailsText(): string {
    if (this.emoji.uids.length === 1) {
      const name = this.getNameFromId(this.emoji.uids[0]);
      if (name === 'Du') return 'Du hast reagiert.'
      return this.getNameFromId(this.emoji.uids[0]) + ' hat reagiert.'
    } else
    if (this.emoji.uids.length === 2) {
      return this.getNameFromId(this.emoji.uids[0]) + ' und ' + this.getNameFromId(this.emoji.uids[1]) + ' haben reagiert.'
    } else

    if (this.emoji.uids.length === 3) {
      return this.getNameFromId(this.emoji.uids[0]) + ', ' + this.getNameFromId(this.emoji.uids[1]) + ' und ' + this.getNameFromId(this.emoji.uids[2]) + ' haben reagiert.'
    } else
    if (this.emoji.uids.length > 3) {
      return this.getNameFromId(this.emoji.uids[0]) + ', ' + this.getNameFromId(this.emoji.uids[1]) + ' und ' + (this.emoji.uids.length - 2) + "<span class='more' (click)='openMore()'> weitere</span> haben reagiert."
    }
    return '';
  }


  /**
   * Returns the name of a user with the given id.
   * If the id matches the current user's id, it returns 'Du'.
   * If no user with the given id exists, it returns 'unbekannter Benutzer'.
   * Otherwise, it returns the name of the user with the given id.
   * @param id The id of the user for which to retrieve the name.
   * @returns The name of the user with the given id.
   */
  getNameFromId(id: string): string {
    if (id === this.chatService.firebase.currentUser.uid!) {
      return 'Du';
    } else {
      return this.chatService.firebase.getUser(id)?.name ?? 'unbekannter Benutzer';
    }

  }
}