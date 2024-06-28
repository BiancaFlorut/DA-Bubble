import { AfterViewInit, Component, ElementRef, InjectionToken, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { ChatService } from '../../../services/chat/chat.service';
import { DirectChat } from '../../../models/direct-chat.class';
import { DatePipe, registerLocaleData } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Message } from '../../../models/message.class';


import { ShowProfileService } from '../../../services/show-profile/show-profile.service';

@Component({
  selector: 'app-chat-body',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './chat-body.component.html',
  styleUrl: './chat-body.component.scss'
})
export class ChatBodyComponent implements AfterViewInit {
  [x: string]: any;
  @ViewChild('scrollSection') scrollSection!: ElementRef;
  @ViewChildren('messageItem') messageItems!: QueryList<any>;
  chatService = inject(ChatService);
  chat!: DirectChat;
  domSanitizer = inject(DomSanitizer);
  pipe = inject(DatePipe);
  formattedDate: string | null = null;
  lastFormattedDate: string | null = null;
  public showProfileService: ShowProfileService = inject(ShowProfileService);

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      this.formattedDate = null;
      this.lastFormattedDate = null;
      if (chat) {
        this.chat = chat;
        this.chat.messages = chat.messages.sort((a, b) => b.timestamp - a.timestamp);
      }
    });
  }
  ngAfterViewInit(): void {
    this.messageItems.changes.subscribe((messageObj) => {
      this.scrollToBottom(messageObj.first);
      this.formattedDate = null;
      this.lastFormattedDate = null;
    })
  }

  public scrollToBottom(elem: ElementRef) {
    if (elem)
      elem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  public sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  isNewDate(index: number): boolean {
    if (index === 0) {
      this.formattedDate = null;
      this.lastFormattedDate = null;
    }
    this.lastFormattedDate = this.formattedDate;
    const date = new Date(this.chat.messages[index].timestamp);
    let nextDate = null;
    const now = new Date();
    if (index <= this.chat.messages.length - 2) {
      nextDate = new Date(this.chat.messages[index + 1].timestamp);
    } else {
      if (now.toDateString() === date.toDateString()) {
        this.formattedDate = 'Heute';
      } else
        if (date.getFullYear() === now.getFullYear())
          this.formattedDate = this.pipe.transform(date, 'EEEE, d MMMM')
        else
          this.formattedDate = this.pipe.transform(date, 'EEEE, d MMMM, y');
      return true;
    }

    if (0 <= index && index < this.chat.messages.length - 1 && nextDate) {
      // heute
      if (now.toDateString() === date.toDateString()) {
        this.formattedDate = 'Heute';
        if (now.toDateString() === nextDate.toDateString()) {
          return false;
        } else {
          return true;
        }
      } else if (date.getFullYear() === now.getFullYear()) {
        const sameYearDate = this.pipe.transform(date, 'EEEE, d MMMM');
        this.formattedDate = sameYearDate;
        if (date.toDateString() === nextDate.toDateString()) {
          return false;
        } else {
          return true;
        }
      } else {
        const differentYearDate = this.pipe.transform(date, 'EEEE, d MMMM, y');
        this.formattedDate = differentYearDate;
        if (date.toDateString() === nextDate.toDateString()) {
          return false;
        } else {
          return true;
        }
      }
    }
    return false;
  }
}
