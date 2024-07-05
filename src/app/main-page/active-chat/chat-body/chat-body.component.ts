import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { ChatService } from '../../../services/chat/chat.service';
import { Chat } from '../../../models/chat.class';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';


import { ShowProfileService } from '../../../services/show-profile/show-profile.service';
import { MessageComponent } from './message/message.component';
import { User } from '../../../interfaces/user';
import { FirebaseService } from '../../../services/firebase/firebase.service';

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
  @ViewChild('scrollSection') scrollSection!: ElementRef;
  @ViewChildren('messageItem') messageItems!: QueryList<any>;
  @Input() chat!: Chat;
  chatService = inject(ChatService);
  user!: User;
  partner: User | undefined;
  domSanitizer = inject(DomSanitizer);
  pipe = inject(DatePipe);
  formattedDate: string | null = null;
  latestFormattedDate: number | null = null;
  lastFormattedDate: string | null = null;
  public showProfileService: ShowProfileService = inject(ShowProfileService);
  firebase = inject(FirebaseService);

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.chat = chat;
        this.chat.messages = chat.messages.sort((a, b) => b.timestamp - a.timestamp);
        this.chat.uids.forEach(uid => {
          if (uid !== this.firebase.currentUser.uid) {
            this.partner = this.firebase.getUser(uid);
          } 
        });
        this.user = this.firebase.currentUser;
      }
    });
  }
  ngAfterViewInit(): void {
    this.messageItems.changes.subscribe((messageObj) => {
      this.scrollToBottom(messageObj.first);
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
    const date = new Date(this.chat!.messages[index].timestamp);
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

  isNewDate(index: number): boolean {
    if (index === 0) {
      this.formattedDate = null;
      this.lastFormattedDate = null;
    }
  
    const date = new Date(this.chat!.messages[index].timestamp);
    const nextDate = index < this.chat!.messages.length - 1 ? new Date(this.chat!.messages[index + 1].timestamp) : null;
    const now = new Date();
  
    this.formattedDate = this.getFormattedDate(date, now);
    
    const isSameDate = nextDate ? this.isSameDay(date, nextDate) : false || this.isToday(date);
    this.lastFormattedDate = this.formattedDate;
    return index === this.chat!.messages.length - 1 || !isSameDate;
  }
  
  getFormattedDate(date: Date, now: Date) {
    if (this.isToday(date)) {
      return 'Heute';
    } else if (date.getFullYear() === now.getFullYear()) {
      return this.pipe.transform(date, 'EEEE, d MMMM');
    } else {
      return this.pipe.transform(date, 'EEEE, d MMMM, y');
    }
  }
  
  isSameDay(date1: Date, date2: Date) {
    return date1 && date2 && date1.toDateString() === date2.toDateString();
  }
  
  isToday(date: Date) {
    return new Date().toDateString() === date.toDateString();
  }
}
