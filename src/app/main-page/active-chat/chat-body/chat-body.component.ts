import { AfterViewInit, Component, Input, QueryList, ViewChildren, effect, inject } from '@angular/core';
import { ChatService } from '../../../services/chat/chat.service';
import { Chat } from '../../../models/chat.class';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ShowProfileService } from '../../../services/show-profile/show-profile.service';
import { MessageComponent } from './message/message.component';
import { User } from '../../../interfaces/user';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { FirebaseChannelService } from '../../../services/firebase-channel/firebase-channel.service';
import { ScrollService } from '../../../services/scroll/scroll.service';

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
  @ViewChildren('messageItem') messageItems!: QueryList<any>;
  @Input() chat: Chat | undefined;
  chatService = inject(ChatService);
  user!: User;
  partner: User | undefined;
  partners: User[] = [];
  domSanitizer = inject(DomSanitizer);
  pipe = inject(DatePipe);
  formattedDate: string | null = null;
  latestFormattedDate: number | null = null;
  lastFormattedDate: string | null = null;
  public showProfileService: ShowProfileService = inject(ShowProfileService);
  firebase = inject(FirebaseService);
  channelService = inject(FirebaseChannelService);
  scrollService = inject(ScrollService);

  constructor() {
    effect(() => {
      this.chat = this.chatService.actualChat();
      if (this.chat) {
        this.chat.messages = this.chat.messages.sort((a, b) => b.timestamp - a.timestamp);
        const rest = this.chat.uids.filter(uid => uid !== this.firebase.currentUser.uid);
        if (rest.length === 0) {
          this.partner = this.firebase.currentUser;
        } else {
          this.partner = this.firebase.users.find(user => user.uid === rest[0]);
        }
        this.user = this.firebase.currentUser;
      }
      if (this.channelService.isChannelSet()) {
        this.partners = this.channelService.usersFromChannel;
      }
      this.checkForScrolling();
      
    }, { allowSignalWrites: true });
  }

  checkForScrolling() {
    if (this.scrollService.midToScroll().length > 0) {
      setTimeout(() => {
        this.scrollMessageIntoView(this.scrollService.midToScroll());
        this.scrollService.midToScroll.set('');
      }, 500)

    }
  }

  ngAfterViewInit(): void {
    this.messageItems.changes.subscribe((messageObj) => {
      this.scrollToBottom(messageObj.first);
    });
  }

  scrollMessageIntoView(mid: string) {
    let element = document.getElementById(mid);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.classList.add('active');
      setTimeout(() => {
        element?.classList.remove('active');
      }, 1200);
    } else console.log("element not found");
    
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
    let date = this.getDate(index);
    let nextDate = this.getNextDate(index);
    const now = new Date();
    if (!date) {
      return false;
    }
    this.formattedDate = this.getFormattedDate(date, now);
    const isSameDate = nextDate ? this.isSameDay(date, nextDate) : false || this.isToday(date);
    this.lastFormattedDate = this.formattedDate;
    const result = this.getIsNewDateResult(index, isSameDate);
    return result;
  }

  getIsNewDateResult(index: number, isSameDay: boolean): boolean {
    if (this.channelService.isChannelSet()) {
      return index === this.channelService.messages.length - 1 || !isSameDay;
    } else if (this.chat) {
      return index === this.chat.messages.length - 1 || !isSameDay;
    }
    return false;
  }

  getDate(index: number): Date | null {
    if (this.channelService.isChannelSet()) {
      return new Date(this.channelService.messages[index].timestamp);
    } else if (this.chat && index < this.chat.messages.length) {
      return new Date(this.chat.messages[index].timestamp);
    }
    return null;
  }

  getNextDate(index: number): Date | null {
    if (this.channelService.isChannelSet() && index < this.channelService.messages.length - 1) {
      return new Date(this.channelService.messages[index + 1].timestamp);
    } else if (this.chat && index < this.chat.messages.length - 1) {
      return new Date(this.chat.messages[index + 1].timestamp);
    }
    return null;
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
