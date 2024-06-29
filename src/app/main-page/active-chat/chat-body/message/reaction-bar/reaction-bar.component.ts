import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Message } from '../../../../../models/message.class';
import { SvgButtonComponent } from '../../../../svg-button/svg-button.component';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [SvgButtonComponent],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent {
  reactions = [
    './assets/img/main-page/reactions/emoji _nerd face_.svg',
    './assets/img/main-page/reactions/emoji _person raising both hands in celebration_.svg',
    './assets/img/main-page/reactions/emoji _rocket_.svg',
    './assets/img/main-page/reactions/emoji _white heavy check mark_.svg'
  ];
  @Input() editable: boolean = false;
  @Input() message!: Message;
  @Output() editMessageEvent = new EventEmitter();
  isMessageMenuOpen: boolean = false;
  @ViewChild('messageMenu') messageMenu!: ElementRef;

  enterSource(elem: any) {
    let img = elem.target as HTMLImageElement;
    img.src = img.src.split(".svg")[0] + "_hover.svg";
  }
  leaveSource(elem: any) {
    let img = elem.target as HTMLImageElement;
    img.src = img.src.split("_hover.svg")[0] + ".svg";
  }

  toggleMessageMenu() {
    this.isMessageMenuOpen = !this.isMessageMenuOpen;
    if (this.isMessageMenuOpen) {
      setTimeout(() => {
        this.isMessageMenuOpen = false;
      }, 2000);
    }
  }

  editMessage() {
    this.editMessageEvent.emit();
    this.isMessageMenuOpen = false;
  }
}
