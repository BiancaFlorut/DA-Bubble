import { Component, ElementRef, Input, Pipe, PipeTransform, SecurityContext, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../models/message.class';
import { ReactionBarComponent } from './reaction-bar/reaction-bar.component';
import { ShowProfileService } from '../../../../services/show-profile/show-profile.service';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../../../services/chat/chat.service';
import { User } from '../../../../interfaces/user';
import { EditableMessageComponent } from './editable-message/editable-message.component';
import { Chat } from '../../../../models/chat.class';
import { EmojiCounterComponent } from './emoji-counter/emoji-counter.component';
import { EmojiPickerButtonComponent } from './emoji-picker-button/emoji-picker-button.component';
import { UserService } from '../../../../services/user/user.service';
import { Emoji } from '../../../../models/emoji.class';
import { SvgButtonComponent } from '../../../svg-button/svg-button.component';
import { FirebaseService } from '../../../../services/firebase/firebase.service';
import { ThreadChatService } from '../../../../services/chat/thread-chat/thread-chat.service';
import { EditUserProfileService } from '../../../../services/edit-user-profile/edit-user-profile.service';
import { EditUserProfileComponent } from '../../../edit-user-profile/edit-user-profile.component';
import { FirebaseChannelService } from '../../../../services/firebase-channel/firebase-channel.service';
import { ToggleDNoneService } from '../../../../services/toggle-d-none/toggle-d-none.service';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  sanitizer = inject(DomSanitizer);
  /**
   * Sanitizes a given string of HTML and highlights any text that is wrapped in <span> tags and contains '@'.
   * If the message is from the current user, the highlighted text is colored white, otherwise it is colored #535AF1.
   * @param text The HTML string to transform.
   * @param isOwn Whether the message is from the current user.
   * @returns The transformed string of HTML.
   */
  transform(text: string, isOwn: boolean) {
    text = this.sanitizer.sanitize(SecurityContext.HTML, text)!;
    if (text && text.includes('@')) {
      const dom = (new DOMParser()).parseFromString(text, "text/html");
      dom.querySelectorAll('span').forEach((span) => {
        if (span.textContent?.includes('@')) {
          if (!isOwn) span.style.color = '#535AF1';
          else span.style.color = '#ECEEFE';
        }
      });
      return this.sanitizer.bypassSecurityTrustHtml(dom.documentElement.outerHTML);
    } return text;
  }
}

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    ReactionBarComponent,
    CommonModule,
    EditableMessageComponent,
    EmojiCounterComponent,
    EmojiPickerButtonComponent,
    SvgButtonComponent,
    EditUserProfileComponent,
    SafeHtmlPipe
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  // encapsulation: ViewEncapsulation.None
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() chat: Chat | undefined;

  user!: User;
  partner: User | undefined = undefined;
  isEditing: boolean = false;
  public showProfileService: ShowProfileService = inject(ShowProfileService);
  public editUserProfileService: EditUserProfileService = inject(EditUserProfileService);
  public toggleDNone: ToggleDNoneService = inject(ToggleDNoneService);
  chatService = inject(ChatService);
  userService = inject(UserService);
  threadService = inject(ThreadChatService);
  cid!: string;
  @ViewChild('messageItem') messageItem!: ElementRef;
  oldMessage: string = '';
  firebase = inject(FirebaseService);
  channelService = inject(FirebaseChannelService);


  /**
   * Constructor for the MessageComponent.
   * Sets the user and partner properties based on the input message.
   * If the message is not set, the user and partner are set to the current user.
   */
  constructor() {
    this.user = this.firebase.currentUser;
    if (this.message)
      this.partner = this.firebase.users.find(user => user.uid === this.message.uid);
  }

  /**
   * Called when the input message or chat changes.
   * Sets the user and partner properties based on the input message and chat.
   * If the message is not set, the user and partner are set to the current user.
   * If the channel service is set and the input message is set, the partner is set to the user
   * from the channel service with the same uid as the message.
   */
  ngOnChanges() {
    this.user = this.firebase.currentUser;
    if (this.chat) {
      this.cid = this.chat.cid;
      const rest = this.chat.uids.filter(uid => uid !== this.firebase.currentUser.uid);
      if (rest.length === 0) {
        this.partner = this.firebase.currentUser;
      } else {
        this.partner = this.firebase.users.find(user => user.uid === rest[0]);
      }
    }
    if (this.channelService.isChannelSet() && this.message) {
      this.partner = this.firebase.users.find(user => user.uid === this.message.uid);
    }
  }

  /**
   * Edits a message in a direct chat or a channel.
   * If the message is an answer, it edits the answer in the thread.
   * If the channel service is set and the message is not an answer, it edits the message in the channel.
   * If the channel service is not set and the message is not an answer, it edits the message in the direct chat.
   * If no message is given, it sets the isEditing flag to true and sets the oldMessage to the current message's text.
   * @param message The message to edit
   */
  async editMessage(message: Message) {
    if (message) {
      if (message.isAnswer) {
        await this.threadService.editMessage(message, this.cid);
      } else if (this.channelService.isChannelSet()) {
        await this.channelService.editMessage(message);
      } else
        await this.chatService.editMessage(this.cid, message);
    }
    else {
      this.isEditing = true;
      this.oldMessage = this.message.text;
    }
  }


  /**
   * Closes the edit mode of the message.
   * If the message is changed and is not an answer, it edits the message in the direct chat.
   * If the message is changed and is an answer, it edits the answer in the thread.
   * If the message is changed and the channel service is set, it edits the message in the channel.
   * If the message is not changed, it sets the message's text to the old text.
   * @param message The message to close the edit mode of
   */
  async closeEdit(message: Message) {
    this.isEditing = false;
    if (message && !this.isWhiteSpace(this.message.text))
      if (message.isAnswer)
        await this.threadService.editMessage(message, this.cid);
      else if (this.channelService.isChannelSet()) {
        await this.channelService.editMessage(message);
      } else
        await this.chatService.editMessage(this.cid, message);
    else {
      this.message.text = this.oldMessage;
    }
  }

  /**
   * Checks if a given string is white space.
   * @param text The string to check.
   * @returns True if the string is white space, false otherwise.
   */
  isWhiteSpace(text: string) {
    const dom = new DOMParser().parseFromString(text, 'text/html');
    const txt = dom.documentElement.textContent;
    const smileyContent = dom.documentElement.getElementsByTagName('img').length;
    if (/^\s*$/.test(txt!) && smileyContent == 0)
      return true;
    return false;
  }

  /**
   * Scrolls the message element into view with a smooth animation.
   */
  scrollIntoView() {
    this.messageItem.nativeElement.scrollIntoView({ behavior: 'smooth'});
  }

  /**
   * Adds a reaction to a message.
   * If the emoji is found in the list of available emojis, it is added to the message.
   * The user service is then updated to reflect the change.
   * The message is then edited with the new emoji.
   * @param id The id of the emoji to add.
   */
  addReaction(id: string) {
    const indexUser = this.userService.emojis.findIndex(e => e.id === id);
    if (indexUser != -1) {
      this.userService.emojis[indexUser].count++;
      const index = this.message.emojis.findIndex(e => e.id === id);
      if (index != -1) {
        if (!this.message.emojis[index].uids.includes(this.firebase.currentUser.uid!)) {
          this.message.emojis[index].count++;
          this.message.emojis[index].uids.push(this.firebase.currentUser.uid!);
        }
      } else {
        const emoji = new Emoji(id, this.userService.emojis[indexUser].path, this.firebase.currentUser.uid!);
        emoji.count = 1;
        this.message.emojis.push(emoji);
      }
      this.userService.sortEmojis();
      this.editMessage(this.message);
    } else {
      console.log('no emoji found in user service');
    }
  }

  /**
   * Checks if the given uid belongs to the current user.
   * @param uid The uid to check.
   * @returns True if the uid belongs to the current user, false otherwise.
   */
  isCurrentUser(uid: string) {
    return uid === this.firebase.currentUser.uid;
  }

  /**
   * Checks if any emojis have been given on the message.
   * @returns True if any emojis have been given, false otherwise.
   */
  areAnyEmojis() {
    let result = false;
    if (this.message.emojis) {
      for (let emoji of this.message.emojis) {
        if (emoji.count > 0) {
          result = true;
          break;
        }
      }
    }

    return result;
  }



  /**
   * Checks if there are any answers to the message in the thread.
   * @returns The number of answers in the thread if there are any, 0 otherwise.
   */
  async areAnswers() {
    const count = await this.threadService.getAnswerCount(this.message.mid, this.chat?.cid!);
    return count;
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

  /**
   * Returns a string that describes the number of answers in the thread.
   * If there is more than one answer, it returns the number of answers followed by "Antworten",
   * otherwise it returns the number of answers followed by "Antwort".
   * @returns A string that describes the number of answers in the thread.
   */
  getAnswerText() {
    return this.message.answerCount + ' ' + (this.message.answerCount > 1 ? 'Antworten' : 'Antwort');
  }

}
