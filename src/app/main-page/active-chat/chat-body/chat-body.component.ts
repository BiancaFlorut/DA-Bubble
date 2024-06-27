import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { ChatService } from '../../../services/chat/chat.service';
import { DirectChat } from '../../../models/direct-chat.class';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';


import { ShowProfileService } from '../../../services/show-profile/show-profile.service';

@Component({
  selector: 'app-chat-body',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule
  ],
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
  latestFormattedDate: number | null = null;
  public showProfileService: ShowProfileService = inject(ShowProfileService);

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.chat = chat;
        this.chat.messages = chat.messages.sort((a, b) => a.timestamp - b.timestamp);
      }
    });
  }
  ngAfterViewInit(): void {
    this.messageItems.changes.subscribe((messageObj) => {
      this.scrollToBottom(messageObj.last);
    })
  }

  public scrollToBottom(elem: ElementRef) {
    if (elem)
      elem.nativeElement.scrollIntoView();
  }

  public sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  public formatDate(index: number): boolean {
    const date = new Date(this.chat.messages[index].timestamp);
    const now = new Date();
    const moreDateData = this.pipe.transform(date, 'EEEE, d MMMM yyyy');
    const moreNowData = this.pipe.transform(now, 'EEEE, d MMMM yyyy');
    if (index === 0) {
      return this.checkDateForFirstMessage(date, now, moreDateData, moreNowData);
    } else {
      return this.checkTimestampeOrNow(date, now, moreDateData, moreNowData);
    }
  }


  private checkDateForFirstMessage(date: Date, now: Date, moreDateData: String | null, moreNowData: String | null) {
    if (moreDateData === moreNowData) {
      this.formattedDate = 'Heute';
      this.latestFormattedDate = now.getDate();
    } else {
      this.formattedDate = this.pipe.transform(date, 'EEEE, d MMMM');
      this.latestFormattedDate = date.getDate();
    }
    return true;
  }

  private checkTimestampeOrNow(date: Date, now: Date, moreDateData: String | null, moreNowData: String | null) {
    if (moreDateData !== moreNowData) {
      this.formattedDate = this.pipe.transform(date, 'EEEE, d MMMM');
      return this.checkLatestDate(date.getDate());
    } else {
      this.formattedDate = 'Heute';
      return this.checkLatestDate(now.getDate());
    }
  }

  private checkLatestDate(date: number): boolean {
    if (this.latestFormattedDate !== date) {
      this.latestFormattedDate = date;
      return true;
    } else {
      return false;
    }
  }
}
