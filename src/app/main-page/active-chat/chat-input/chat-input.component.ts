import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat/chat.service';
import { Chat } from '../../../models/chat.class';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { AutosizeModule } from 'ngx-autosize';
import { Message } from '../../../models/message.class';
import { EmojiPickerButtonComponent } from '../chat-body/message/emoji-picker-button/emoji-picker-button.component';
import { ThreeStatesButtonComponent } from '../../svg-button/three-states-button/three-states-button.component';
import { UserService } from '../../../services/user/user.service';
import { NgxEditorModule } from 'ngx-editor';
import { Editor } from 'ngx-editor';
import { User } from '../../../interfaces/user';
import { ThreadChatService } from '../../../services/chat/thread-chat/thread-chat.service';


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, CommonModule, AutosizeModule, EmojiPickerButtonComponent, ThreeStatesButtonComponent, NgxEditorModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Input() isThread: boolean = false;
  message: string = '';
  chatService: ChatService = inject(ChatService);
  threadService: ThreadChatService = inject(ThreadChatService);
  currentChat!: Chat;
  user!: User;
  partner: User | undefined;
  firebase: FirebaseService = inject(FirebaseService);
  placeholderText: string = 'Einen Nachricht schreiben...';
  isHoveringOptions: boolean = false;
  userService = inject(UserService);
  editor!: Editor;

  ngOnInit(): void {
    this.editor = new Editor();
  }

  ngOnDestroy(): void {
    if (this.editor)
      this.editor.destroy();
  }

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.currentChat = chat;
        const rest = this.currentChat.uids.filter(uid => uid !== this.firebase.currentUser.uid);
        if (rest.length === 0) {
          this.partner = this.firebase.currentUser;
        } else {
          this.partner = this.firebase.getUser(rest[0]);
        }
        this.user = this.firebase.currentUser;
      }
      if (this.isThread)
        this.placeholderText = 'Antworten...';
      else
      this.replacePlaceholder();
        setTimeout(() => {
          if (this.editor) {
            this.editor.commands.focus().exec();
          }
        }, 10);
    });
  }

  async sendMessage() {
    if (this.isThread) {
      // send message in the thread
      const mid = this.threadService.message.mid;
      const messages = this.threadService.messages;
      if (messages.length === 0) {
        if (this.currentChat.cid && mid)
          this.firebase.setThread(this.currentChat.cid, mid);
        else
          console.log('no cid or mid create a thread');
      }
      const message = new Message(mid, this.firebase.currentUser.uid!, this.message, Date.now(), []);
      message.isAnswer = true;
      this.firebase.addThreadMessage(this.threadService.chat!.cid, mid, message);
      message.isAnswer = false;
      this.threadService.message.answerCount++;
      console.log('update direct message: ', this.currentChat.cid, mid, this.threadService.message);
      
      this.firebase.updateMessage(this.currentChat.cid, mid, this.threadService.message);
    } else {
      if (this.firebase.currentUser.uid) {
        const mid = await this.firebase.sendMessage(this.currentChat.cid, this.firebase.currentUser.uid, Date.now(), this.message);
        const message = new Message(mid.id, this.firebase.currentUser.uid, this.message, Date.now(), []);
        this.firebase.updateMessage(this.currentChat.cid, mid.id, message);
      } else console.log('no user is logged in');
    }
    this.message = '';
  }

  replacePlaceholder() {
    if (this.partner && this.user) {
      if (this.user.uid === this.firebase.currentUser.uid) {
        if (this.partner.uid === this.firebase.currentUser.uid) {
          this.placeholderText = `Nachricht an dir`;
        } else
          this.placeholderText = `Nachricht an ${this.partner.name}`
      } else {
        this.placeholderText = `Nachricht von ${this.user.name}`
      }
    }
  }

  addEmoji(id: string) {
    const emoji = this.userService.emojis.find(emoji => emoji.id === id);
    if (emoji) {
      this.editor?.commands.insertImage(emoji?.path).exec();
      this.editor?.commands.focus().exec();
    }
  }

}
