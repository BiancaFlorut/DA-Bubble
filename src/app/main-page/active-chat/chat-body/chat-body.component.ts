import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { ChatService } from '../../../services/chat/chat.service';
import { DirectChat } from '../../../models/direct-chat.class';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';


import { ShowProfileService } from '../../../services/show-profile/show-profile.service';
import { ReactionBarComponent } from './message/reaction-bar/reaction-bar.component';
import { MessageComponent } from './message/message.component';

@Component({
  selector: 'app-chat-body',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    MessageComponent
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

  public scrollToBottom(elem: any) {
    if (elem)
      elem.scrollIntoView();
  }

  public sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  public formatDate(index: number): boolean {
    const date = new Date(this.chat.messages[index].timestamp);
    const now = new Date();
    const moreDateData = this.pipe.transform(date, 'EEEE, d MMMM yyyy');
    const moreNowData = this.pipe.transform(now, 'EEEE, d MMMM yyyy');
    if (moreDateData !== moreNowData) {
      this.formattedDate = this.pipe.transform(date, 'EEEE, d MMMM');
      return this.checkLatestDate(date.getDate(), index);
    } else {
      this.formattedDate = 'Heute';
      return this.checkLatestDate(now.getDate(), index);
    }
  }

  private checkLatestDate(date: number, index: number): boolean {
    if (this.latestFormattedDate !== date || index === 0) {
      this.latestFormattedDate = date;
      return true;
    } else {
      return false;
    }
  }
}
