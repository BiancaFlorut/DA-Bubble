import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { FirebaseService } from '../../../../../services/firebase/firebase.service';
import { NgxEditorModule } from 'ngx-editor';
import { Editor } from 'ngx-editor';
import { EmojiPickerButtonComponent } from '../emoji-picker-button/emoji-picker-button.component';
import { ThreeStatesButtonComponent } from '../../../../svg-button/three-states-button/three-states-button.component';
import { UserService } from '../../../../../services/user/user.service';

@Component({
  selector: 'app-editable-message',
  standalone: true,
  imports: [FormsModule, EmojiPickerButtonComponent, ThreeStatesButtonComponent, AutosizeModule, NgxEditorModule],
  templateUrl: './editable-message.component.html',
  styleUrl: './editable-message.component.scss'
})
export class EditableMessageComponent {
  @Input() message!: Message;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @Output() closeEditEvent = new EventEmitter<Message>();
  firebase: FirebaseService = inject(FirebaseService);
  editor!: Editor;
  isHoveringOptions: boolean = false;
  userService = inject(UserService);

  constructor() { 
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.editor.setContent(this.message.text);
  }

  // make sure to destory the editor
  ngOnDestroy(): void {
    if (this.editor)
    this.editor.destroy();
  }

  ngAfterViewInit(): void {
    this.editor?.commands.focus().exec();
  }

  cancelEdit() {
    this.editor?.setContent(this.message.text);
    this.closeEditEvent.emit();
  }

  saveMessage() {
    this.message.editedTimestamp = Date.now();
    this.closeEditEvent.emit(this.message);
  }

  hover() {
    this.isHoveringOptions = true;
  }

  leave() {
    this.isHoveringOptions = false;
  }

  addEmoji(id: string) {
    const emoji = this.userService.emojis.find(emoji => emoji.id === id);
    if (emoji) {
      this.editor?.commands.insertImage(emoji?.path).exec();
      this.editor?.commands.focus().exec();
    }
  }
}
