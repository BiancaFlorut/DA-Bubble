import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
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
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';
import { UserListComponent } from '../user-list/user-list.component';


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, CommonModule, AutosizeModule, EmojiPickerButtonComponent, ThreeStatesButtonComponent, NgxEditorModule, UserListComponent],
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
  users: User[] = [];
  partner: User | undefined;
  firebase: FirebaseService = inject(FirebaseService);
  placeholderText: string = 'Einen Nachricht schreiben...';
  isHoveringOptions: boolean = false;
  userService = inject(UserService);
  editor!: Editor;
  fileName: string = '';
  storage = getStorage();
  channelService = inject(FirebaseChannelService);
  loading: boolean = false;
  isUserListOpen: boolean = false;
  usersToMessage: User[] = [];

  ngOnInit(): void {
    this.editor = new Editor();
      this.editor.commands.focus().exec();
    if (this.channelService.isChannelSet()){
      this.users = this.channelService.usersFromChannel;
    }
  }

  ngOnDestroy(): void {
    if (this.editor)
      this.editor.destroy();
  }

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      this.users = [];
      if (chat) {
        this.currentChat = chat;
        const rest = this.currentChat.uids.filter(uid => uid !== this.firebase.currentUser.uid);
        if (rest.length === 0) {
          this.partner = this.firebase.currentUser;
          this.users.push(this.firebase.currentUser);
        } else {
          this.partner = this.firebase.getUser(rest[0]);
          for (let i = 0; i < rest.length; i++) {
            this.users.push(this.firebase.getUser(rest[i])!);
          }
        }
        this.user = this.firebase.currentUser;
      }
    });
  }


  getPlaceholderText() {
    if (this.isThread){
      return 'Antworten...';
    }
    else if (this.channelService.isChannelSet()){
      this.users = this.channelService.usersFromChannel;
      return 'Nachricht an #' + this.channelService.channel.name;
    }
    else if (this.chatService.chat)
      return this.replacePlaceholder();
    return 'Einen Nachricht schreiben...';
  }

  async sendMessage() {
    console.log("message to sent: " + this.message);
    console.log("users to message: " + this.usersToMessage);
    
    if (!this.isWhiteSpace(this.message))
      if (this.isThread) {
        await this.sendThreadMessage();
        console.log("sent thread message");
        
      }else if(this.chatService.newMessage) {
        console.log("new message to be sent to: " + this.usersToMessage.length);
        for (let partner of this.usersToMessage) {
          console.log("sending message to: " + partner.name);
          await this.chatService.sendMessageToUser(partner.uid!, this.message);
          console.log("sent message to: " + partner.name);
          
        }
        console.log("message sent to users end");
        this.usersToMessage = [];
      }     
      else {
        if (this.channelService.isChannelSet()) {
          await this.channelService.sendMessage(this.message);
          console.log("sent channel message");
        } else
          if (this.firebase.currentUser.uid && this.currentChat && this.currentChat.cid) {
            const mid = await this.firebase.sendMessage(this.currentChat.cid, this.firebase.currentUser.uid, Date.now(), this.message);
            const message = new Message(mid.id, this.firebase.currentUser.uid, this.message, Date.now(), []);
            await this.firebase.updateMessage(this.currentChat.cid, mid.id, message);
            console.log("sent chat message");
          } 
          else console.log('no user is logged in');
      }
    this.message = '';
  }

  async sendThreadMessage() {
    const mid = this.threadService.message.mid;
    const messages = this.threadService.messages;
    if (messages.length === 0) {
      this.createThreadMessage(mid);
    }
    const message = new Message(mid, this.firebase.currentUser.uid!, this.message, Date.now(), []);
    message.isAnswer = true;
    await this.addMessageToThread(mid, message);
    message.isAnswer = false;
    this.threadService.message.answerCount++;
    this.threadService.message.lastAnswerTimestamp = message.timestamp;
    this.updateThreadMessage(mid);
  }

  createThreadMessage(mid: string) {
    if (this.currentChat && this.currentChat.cid && mid)
      this.firebase.setThread(this.currentChat.cid, mid);
    else
      if (this.channelService.isChannelSet())
        this.channelService.setThread(mid);
      else
        console.log('no cid or mid create a thread');
  }

  async addMessageToThread(mid: string, message: Message) {
    if (this.channelService.isChannelSet())
      await this.channelService.addThreadMessage(mid, message);
    else if (this.currentChat.cid && mid)
      await this.firebase.addThreadMessage(this.threadService.chat!.cid, mid, message);
  }

  updateThreadMessage(mid: string) {
    if (this.channelService.isChannelSet()) {
      this.firebase.updateRefMessage(this.channelService.getChannelRefForMessage(mid), this.threadService.message);
    } else
      this.firebase.updateMessage(this.currentChat.cid, mid, this.threadService.message);
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
        this.loading = true;
        const storageRef = ref(this.storage, `temp/files/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(uploadResult.ref);
        this.loading = false;
        if (file.type.includes('image'))
          this.editor.commands.insertImage(url, { width: '100px' }).exec();
        else {
          this.editor.commands
            .insertLink(file.name, { href: url } )
            .insertNewLine()
            .insertImage("./assets/img/main-page/input/pdf.png", { width: '80px' })
            .insertNewLine()
            .focus()
            .exec()
        }
      } else {
        window.alert('Bitte wähle nur Bilder oder PDFs aus!');
      }
    }
  }

  showUsersList() {
    this.isUserListOpen = true;
    if (this.isThread) this.users = this.threadService.users;
    if (this.chatService.newMessage)
      Object.assign(this.users, this.firebase.users);
    if (this.users.find(user => user.uid === this.firebase.currentUser.uid)) {
      this.users.splice(this.users.findIndex(user => user.uid === this.firebase.currentUser.uid), 1);
    }
  }

  selectUser(user: User) {
    this.usersToMessage.push(user);
    console.log(this.usersToMessage);
    let html = /*html*/`
        <span style="color: #535AF1;">@${user.name}</span>
    `;
    this.isUserListOpen = false;
    this.editor?.commands.
    textColor("#535AF1").    
    insertHTML(html).
    exec();
    this.editor?.commands.
    textColor("#000000").
    insertHTML(`&nbsp;`).
    insertText(` `).
    focus().
    exec();
  }

  closeUsersList(event : Event) {
    event.stopPropagation();
    this.isUserListOpen = false;
  }
}
