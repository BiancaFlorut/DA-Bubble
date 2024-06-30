import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { SvgButtonComponent } from '../../../../svg-button/svg-button.component';
import { AutosizeModule } from 'ngx-autosize';
import { FirebaseService } from '../../../../../services/firebase/firebase.service';

@Component({
  selector: 'app-editable-message',
  standalone: true,
  imports: [FormsModule, SvgButtonComponent, AutosizeModule],
  templateUrl: './editable-message.component.html',
  styleUrl: './editable-message.component.scss'
})
export class EditableMessageComponent {
  @Input() message!: Message;
  @ViewChild('messageInput') messageInput!: ElementRef;
  @Output() closeEditEvent = new EventEmitter<Message>();
  firebase: FirebaseService = inject(FirebaseService);

  constructor() { 
  }

  ngAfterViewInit(): void {
    this.messageInput.nativeElement.focus();
  }

  cancelEdit() {
    this.closeEditEvent.emit();
  }

  saveMessage() {
    this.message.editedTimestamp = Date.now();
    this.closeEditEvent.emit(this.message);
  }
}
