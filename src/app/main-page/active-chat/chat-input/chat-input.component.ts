import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
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


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, CommonModule, AutosizeModule, EmojiPickerButtonComponent, ThreeStatesButtonComponent, NgxEditorModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  message: string = '';
  chatService: ChatService = inject(ChatService);
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
        this.replacePlaceholder();
        setTimeout(() => {
          this.editor?.commands.focus().exec();
        }, 10);
        this.currentChat.uids.forEach(uid => {
          if (uid !== this.firebase.currentUser.uid) {
            this.partner = this.firebase.getUser(uid);
          } 
          
        });
        this.user = this.firebase.currentUser;
      }
    });
  }

  async sendMessage() {
    if (this.firebase.currentUser.uid) {
      const mid = await this.firebase.sendMessage(this.currentChat.cid, this.firebase.currentUser.uid, Date.now(), this.message);
      const message = new Message(mid.id, this.firebase.currentUser.uid, this.message, Date.now(), []);
      this.firebase.updateMessage(this.currentChat.cid, mid.id, message);
    } else console.log('no user is logged in');
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
