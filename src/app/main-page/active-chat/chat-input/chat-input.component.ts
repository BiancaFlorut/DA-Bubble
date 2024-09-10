import { CommonModule } from '@angular/common';
import { Component, Input, effect, inject, signal } from '@angular/core';
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
import { NewMessageService } from '../../../services/new-message/new-message.service';


@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule, CommonModule, AutosizeModule, EmojiPickerButtonComponent, ThreeStatesButtonComponent, NgxEditorModule, UserListComponent],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @Input() isThread: boolean = false;
  message = signal('');
  isMessageWhiteSpace = signal(false);
  chatService: ChatService = inject(ChatService);
  threadService: ThreadChatService = inject(ThreadChatService);
  newMessageService: NewMessageService = inject(NewMessageService);
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

  /**
   * Initializes the component.
   * Sets up the editor and focuses on it.
   * If the channel is set, it sets the users to the channel's users.
   */
  ngOnInit(): void {
    this.editor = new Editor();
    this.editor.commands.focus().exec();
    if (this.channelService.isChannelSet()) {
      this.users = this.channelService.usersFromChannel;
    }
  }

  /**
   * Destroys the editor to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.editor)
      this.editor.destroy();
  }

  /**
   * Initializes the component.
   * Sets up the users, current chat and partner.
   * If the channel is set, it sets the users to the channel's users.
   * Also sets up a effect that listens to changes in the chat.
   * When the chat changes, it updates the current chat and the users.
   */
  constructor() {
    effect(() => {
      this.users = [];
      let chat = this.chatService.chat();
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
      this.onInput();
    }, { allowSignalWrites: true });
  }

  /**
   * Returns the placeholder text for the input field.
   * If the chat is a thread, it returns 'Antworten...'.
   * If the channel is set, it returns 'Nachricht an <channel name>'.
   * If the chat is not a thread and the channel is not set, it returns 'Einen Nachricht schreiben...'.
   * Otherwise, it returns the result of {@link replacePlaceholder}.
   * @returns {string} The placeholder text.
   */
  getPlaceholderText() {
    if (this.isThread) {
      return 'Antworten...';
    }
    else if (this.channelService.isChannelSet()) {
      this.users = this.channelService.usersFromChannel;
      return 'Nachricht an #' + this.channelService.channel.name;
    }
    else if (this.chatService.chat())
      return this.replacePlaceholder();
    return 'Einen Nachricht schreiben...';
  }


  /**
   * Sends a message to the current chat.
   * If the message is white space, it does nothing.
   * If the chat is a thread, it sends the message to the thread.
   * If the chat is not a thread but a new message, it sends the message to the chat.
   * If the channel is set, it sends the message to the channel.
   * If the chat is not a thread and the channel is not set, it sends the message to the chat.
   * After sending the message, it resets the input field and focuses on it.
   */
  async sendMessage() {
    if (!this.isMessageWhiteSpace())
      if (this.isThread) await this.sendThreadMessage();
      else if (this.chatService.newMessage()) await this.sendNewMessage();
      else {
        if (this.channelService.isChannelSet()) await this.channelService.sendMessage(this.message());
        else
          if (this.firebase.currentUser.uid && this.currentChat && this.currentChat.cid) {
            const mid = await this.firebase.sendMessage(this.currentChat.cid, this.firebase.currentUser.uid, Date.now(), this.message());
            const message = new Message(mid.id, this.firebase.currentUser.uid, this.message(), Date.now(), []);
            await this.firebase.updateMessage(this.currentChat.cid, mid.id, message);
          }
          else console.log('no user is logged in');
      }
    
    this.message.set('');
    this.isMessageWhiteSpace.set(true);
    this.editor.commands.focus().exec();
  }

  /**
   * Sends a message to all the selected users and channels.
   * If the users to message are selected, it sends the message to each of them.
   * If the channels to message are selected, it sends the message to each of them.
   * Afterwards, it resets the selected users and channels.
   */
  async sendNewMessage() {
    if (this.newMessageService.selectedUserChats().length > 0) {
      for (let partner of this.newMessageService.selectedUserChats()) {
        await this.chatService.sendMessageToUser(partner.uid!, this.message());
      }
      this.newMessageService.selectedUserChats.set([]);
    }
    if (this.newMessageService.selectedChannels().length > 0) {
      for (let channel of this.newMessageService.selectedChannels()) {
        await this.channelService.sendMessageToChannel(channel.id, this.message());
      }
      this.newMessageService.selectedChannels.set([]);
    }
  }

  /**
   * Sends a message to the current thread.
   * If the thread has no messages, it creates a new thread message.
   * If the thread has messages, it sends the message as an answer to the thread.
   * After sending the message, it increases the answer count of the thread message and updates its last answer timestamp.
   * @param mid The id of the message to which the thread belongs.
   */
  async sendThreadMessage() {
    const mid = this.threadService.message().mid;
    const messages = this.threadService.messages();
    if (messages.length === 0) {
      this.createThreadMessage(mid);
    }
    const message = new Message(mid, this.firebase.currentUser.uid!, this.message(), Date.now(), []);
    message.isAnswer = true;
    await this.addMessageToThread(mid, message);
    message.isAnswer = false;
    let msg = this.threadService.message();
    msg.answerCount++;
    msg.lastAnswerTimestamp = message.timestamp;
    this.threadService.message.set(msg);
    this.updateThreadMessage(mid);
  }

  /**
   * Creates a new thread in the current chat or channel.
   * @param mid The id of the message to which the thread belongs.
   */
  createThreadMessage(mid: string) {
    if (this.currentChat && this.currentChat.cid && mid)
      this.firebase.setThread(this.currentChat.cid, mid);
    else
      if (this.channelService.isChannelSet())
        this.channelService.setThread(mid);
      else
        console.log('no cid or mid create a thread');
  }

  /**
   * Adds a new message to an existing thread in the current chat or channel.
   * @param mid The id of the message to which the new message should be added as a thread.
   * @param message The message to add.
   */
  async addMessageToThread(mid: string, message: Message) {
    if (this.channelService.isChannelSet())
      await this.channelService.addThreadMessage(mid, message);
    else if (this.currentChat.cid && mid)
      await this.firebase.addThreadMessage(this.threadService.chat()!.cid, mid, message);
  }

  /**
   * Updates a thread message in the current chat or channel.
   * @param mid The id of the message to which the thread belongs.
   */
  updateThreadMessage(mid: string) {
    if (this.channelService.isChannelSet()) {
      this.firebase.updateRefMessage(this.channelService.getChannelRefForMessage(mid), this.threadService.message());
    } else
      this.firebase.updateMessage(this.currentChat.cid, mid, this.threadService.message());
  }

  /**
   * Checks if a given string is white space.
   * @param text The string to check.
   * @returns True if the string is white space, false otherwise.
   */
  isWhiteSpace(text: string) {
    return /^\s*$/.test(text);
  }

  /**
   * Returns the placeholder text for the input field.
   * If the chat is a thread, it returns 'Antworten...'.
   * If the channel is set, it returns 'Nachricht an <channel name>'.
   * If the chat is not a thread and the channel is not set, it returns 'Einen Nachricht schreiben...'.
   * Otherwise, it returns one of the following:
   * - 'Nachricht an dir' if the user is the same as the current user.
   * - 'Nachricht an <partner name>' if the user is different from the current user.
   * - 'Nachricht von <user name>' if the user is not the current user.
   * @returns {string} The placeholder text.
   */
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

  /**
   * Adds an emoji to the input field.
   * @param id The id of the emoji to add.
   * If the emoji is found in the list of available emojis, it is added to the input field.
   * The focus is then set back to the input field.
   * The isMessageWhiteSpace observable is set to false.
   */
  addEmoji(id: string) {
    const emoji = this.userService.emojis.find(emoji => emoji.id === id);
    if (emoji) {
      this.editor?.commands.insertImage(emoji?.path, { width: '20px' }).focus().exec();
      // this.editor?.commands.focus().exec();
    }
    this.isMessageWhiteSpace.set(false);
  }

  /**
   * Handles the file input event.
   * If a file is selected, it checks if the file is an image or a pdf and its size is less than 500000 bytes.
   * If the conditions are met, it uploads the file to the firebase storage and inserts a link to the file in the editor.
   * The file name is set as the link text.
   * If the file is a pdf, it inserts the pdf icon instead of the file itself.
   * The focus is then set back to the editor.
   * If the file does not meet the conditions, it shows an alert with an appropriate message.
   */
  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.size < 500000) {
      this.fileName = file.name;
      if (file.type.includes('image') || file.type.includes('pdf')) {
        this.loading = true;
        const storageRef = ref(this.storage, `temp/files/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(uploadResult.ref);
        this.loading = false;
        let imgPath = url;
        if (file.type.includes('pdf'))
          imgPath = './assets/img/main-page/input/pdf.png';
        this.editor.commands
          .insertLink(file.name, { href: url })
          .insertNewLine()
          .insertImage(imgPath, { width: '80px' })
          .insertNewLine()
          .focus()
          .exec()
      } else {
        window.alert('Bitte wähle nur Bilder oder PDFs aus!');
      }
    } else {
      window.alert('Die Datei ist zu groß!');
    }
  }

  /**
   * Toggles the user list open or closed. If the current chat is a thread, the users
   * of the thread are shown. If the current chat is a new message, all users of the
   * firebase are shown.
   */
  showUsersList() {
    this.isUserListOpen = true;
    if (this.isThread) this.users = this.threadService.users;
    if (this.chatService.newMessage())
      this.users = this.firebase.users;
  }

  /**
   * Selects a user from the user list and inserts the user's name into the editor
   * as a link. The user list is then closed and the focus is set back to the editor.
   * @param user The user to be selected.
   */
  selectUser(user: User) {
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

  /**
   * Closes the user list if it is open.
   * @param event The event that triggered this function.
   */
  closeUsersList(event: Event) {
    event.stopPropagation();
    this.isUserListOpen = false;
  }

  /**
   * Checks if the message is only whitespace (and not a smiley).
   * If it is, sets the isMessageWhiteSpace signal to true, otherwise to false.
   * This is used to disable the send button if the message is empty.
   */
  onInput() {
    const dom = new DOMParser().parseFromString(this.message(), 'text/html');
    const text = dom.documentElement.textContent;
    const smileyContent = dom.documentElement.getElementsByTagName('img').length;
    if (this.isWhiteSpace(text!) && smileyContent == 0)
      this.isMessageWhiteSpace.set(true);
    else
      this.isMessageWhiteSpace.set(false);
  }
  
}
