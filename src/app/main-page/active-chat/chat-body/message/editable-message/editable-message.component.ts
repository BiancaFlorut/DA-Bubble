import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { SvgButtonComponent } from '../../../../svg-button/svg-button.component';
import { AutosizeModule } from 'ngx-autosize';
import { FirebaseService } from '../../../../../services/firebase/firebase.service';
import { NgxEditorModule } from 'ngx-editor';
import { Editor } from 'ngx-editor';

@Component({
  selector: 'app-editable-message',
  standalone: true,
  imports: [FormsModule, SvgButtonComponent, AutosizeModule, NgxEditorModule],
  templateUrl: './editable-message.component.html',
  styleUrl: './editable-message.component.scss'
})
export class EditableMessageComponent {
  @Input() message!: Message;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @Output() closeEditEvent = new EventEmitter<Message>();
  firebase: FirebaseService = inject(FirebaseService);
  editor!: Editor;

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
}
