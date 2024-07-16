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
import { HttpClient } from '@angular/common/http';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';
import { collection, doc } from 'firebase/firestore';


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
  fileName: string = '';
  storage = getStorage();
  channelService = inject(FirebaseChannelService);

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
      else if (this.channelService.isChannelSet())
        this.placeholderText = 'Nachricht an #' + this.channelService.channel.name;
      else if (this.chatService.chat)
        this.replacePlaceholder();
      else
        this.placeholderText = 'Einen Nachricht schreiben...';
      if (this.editor) {
        this.editor.commands.focus().exec();
      }

    });
  }

  getPlaceholderText() {
    if (this.isThread)
      return 'Antworten...';
    else if (this.channelService.isChannelSet())
      return 'Nachricht an #' + this.channelService.channel.name;
    else if (this.chatService.chat)
      return this.replacePlaceholder();
    else return 'Einen Nachricht schreiben...';
  }

  async sendMessage() {
    if (!this.isWhiteSpace(this.message))
    if (this.isThread) {
      const mid = this.threadService.message.mid;
      const messages = this.threadService.messages;
      if (messages.length === 0) {
        if (this.currentChat && this.currentChat.cid && mid)
          this.firebase.setThread(this.currentChat.cid, mid);
        else
          if (this.channelService.isChannelSet())
            this.channelService.setThread(mid);
          else
            console.log('no cid or mid create a thread');
      }
      const message = new Message(mid, this.firebase.currentUser.uid!, this.message, Date.now(), []);
      message.isAnswer = true;
      if (this.channelService.isChannelSet())
        this.channelService.addThreadMessage(mid, message);
      else if (this.currentChat.cid && mid)
        this.firebase.addThreadMessage(this.threadService.chat!.cid, mid, message);
      message.isAnswer = false;
      this.threadService.message.answerCount++;
      this.threadService.message.lastAnswerTimestamp = message.timestamp;
      if (this.channelService.isChannelSet()) {
        this.firebase.updateRefMessage(this.channelService.getChannelRefForMessage(mid), this.threadService.message);
      } else
        this.firebase.updateMessage(this.currentChat.cid, mid, this.threadService.message);
    } else {
      if (this.channelService.isChannelSet()) {
        await this.channelService.sendMessage(this.message);
      } else
        if (this.firebase.currentUser.uid) {
          const mid = await this.firebase.sendMessage(this.currentChat.cid, this.firebase.currentUser.uid, Date.now(), this.message);
          const message = new Message(mid.id, this.firebase.currentUser.uid, this.message, Date.now(), []);
          this.firebase.updateMessage(this.currentChat.cid, mid.id, message);
        } else console.log('no user is logged in');
    }
    this.message = '';
  }

  isWhiteSpace(text: string) {
    return text.trim().length === 0;
  }

  replacePlaceholder() {
    if (this.partner && this.user) {
      if (this.user.uid === this.firebase.currentUser.uid) {
        if (this.partner.uid === this.firebase.currentUser.uid) {
          return `Nachricht an dir`;
        } else
          return `Nachricht an ${this.partner.name}`
      } else {
        return `Nachricht von ${this.user.name}`
      }
    }
    return 'Einen Nachricht schreiben...';
  }

  addEmoji(id: string) {
    const emoji = this.userService.emojis.find(emoji => emoji.id === id);
    if (emoji) {
      this.editor?.commands.insertImage(emoji?.path, { width: '20px' }).exec();
      this.editor?.commands.focus().exec();
    }
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fileName = file.name;
      if (file.type.includes('image') || file.type.includes('pdf')) {
        const storageRef = ref(this.storage, `temp/files/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(uploadResult.ref);
        if (file.type.includes('image'))
          this.editor.commands.insertImage(url, { width: '100px' }).exec();
        // else
        // this.editor.commands.insertFile(url).exec();

      }
    }
  }

}
