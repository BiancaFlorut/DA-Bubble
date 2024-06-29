import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Message } from '../../../../../models/message.class';
import { FormsModule } from '@angular/forms';
import { SvgButtonComponent } from '../../../../svg-button/svg-button.component';
import { AutosizeModule } from 'ngx-autosize';

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
  @Output() cancelEditEvent = new EventEmitter();

  constructor() { 
  }

  ngAfterViewInit(): void {
    this.messageInput.nativeElement.focus();
  }

  cancelEdit() {
    this.cancelEditEvent.emit();
  }
}
