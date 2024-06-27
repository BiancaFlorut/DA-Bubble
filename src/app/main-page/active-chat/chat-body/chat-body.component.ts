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
        this.chat.messages = chat.messages.sort((a, b) => a.timestamp - b.timestamp);
        this.chat.messages = this.chat.messages.reverse();
      }
    });
  }
  ngAfterViewInit(): void {
    this.messageItems.changes.subscribe((messageObj) => {
      this.scrollToBottom(messageObj.first);
    })
  }

  public scrollToBottom(elem: ElementRef) {
    if (elem)
      elem.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  public sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  public formatDate(index: number): boolean {
      this.lastFormattedDate = this.formattedDate;
    const date = new Date(this.chat.messages[index].timestamp);
    const now = new Date();
    console.log('last date: ', this.formattedDate);
    console.log('message ', this.chat.messages[index].text, ' date: ', this.pipe.transform(date, 'EEEE, d MMMM, y'));
    if (now.getDate() === date.getDate() && !this.formattedDate) {
      this.formattedDate = 'Heute';
      console.log('new date: ', this.formattedDate);
      if (this.lastFormattedDate && this.lastFormattedDate !== this.formattedDate) {
        console.log('Returning: ', 'Heute');
        return true;
      }
        
    } else if (now.getDate() === date.getDate() && this.formattedDate === 'Heute') {
      console.log('no return date: last', this.lastFormattedDate, ' this: ', this.formattedDate );
      return false;
    } else if (date.getFullYear() === now.getFullYear()) {
      const sameYear = this.pipe.transform(date, 'EEEE, d MMMM');
      if (this.formattedDate !== sameYear) {
        this.formattedDate = sameYear;
        console.log('new date: ', this.formattedDate);
        if (this.lastFormattedDate && this.lastFormattedDate !== this.formattedDate) {
          console.log('Returning: ', this.lastFormattedDate);
          return true;
        }
          
      }
    } else {
      const differentYear = this.pipe.transform(date, 'EEEE, d MMMM, y');
      if (this.formattedDate !== differentYear) {
        this.formattedDate = differentYear;
        console.log('new date: ', this.formattedDate);
        if (this.lastFormattedDate && this.lastFormattedDate !== this.formattedDate) {
          console.log('Returning: ', this.lastFormattedDate);
          return true;
        }
          
      }
    }
    console.log('no return date: last', this.lastFormattedDate, ' this: ', this.formattedDate );
    return false;
    }
}
