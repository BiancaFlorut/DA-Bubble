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

  /**
   * Initializes the component.
   * Creates a new instance of the Editor, sets its content to the message's text
   * and sets the editor to the component's editor property.
   */
  ngOnInit(): void {
    this.editor = new Editor();
    this.editor.setContent(this.message.text);
  }

  /**
   * Destroys the editor to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.editor)
    this.editor.destroy();
  }

  /**
   * Focuses the editor after the view has been initialized.
   * This is needed because the editor is only rendered after the view has been initialized.
   */
  ngAfterViewInit(): void {
    this.editor?.commands.focus().exec();
  }

  /**
   * Cancels the editing of a message.
   * Resets the editor's content to the original message's text and emits the closeEditEvent.
   */
  cancelEdit() {
    this.editor?.setContent(this.message.text);
    this.closeEditEvent.emit();
  }

  /**
   * Saves the edited message and emits the closeEditEvent.
   * The edited timestamp of the message is set to the current time.
   */
  saveMessage() {
    this.message.editedTimestamp = Date.now();
    this.closeEditEvent.emit(this.message);
  }

  /**
   * Sets the isHoveringOptions flag to true, which enables the options container (send, edit, delete)
   * of the message to be visible.
   */
  hover() {
    this.isHoveringOptions = true;
  }

  /**
   * Sets the isHoveringOptions flag to false, which disables the options container (send, edit, delete)
   * of the message to be visible.
   */
  leave() {
    this.isHoveringOptions = false;
  }

  /**
   * Adds an emoji to the input field.
   * @param id The id of the emoji to add.
   * If the emoji is found in the list of available emojis, it is added to the input field.
   * The focus is then set back to the input field.
   */
  addEmoji(id: string) {
    const emoji = this.userService.emojis.find(emoji => emoji.id === id);
    if (emoji) {
      this.editor?.commands.insertImage(emoji?.path).exec();
      this.editor?.commands.focus().exec();
    }
  }
}
