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

  /**
   * Sets up the component by getting the current chat from the service,
   * sorting its messages by timestamp, and determining the partner of the
   * current user. It also sets the user property to the current user.
   * If the channel service is set, it sets the partners property to the users
   * in the channel. Finally, it calls the checkForScrolling method.
   */
  constructor() {
    effect(() => {
      this.chat = this.chatService.chat();
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

  /**
   * Checks if there is a message that needs to be scrolled into view.
   * If there is, it waits 500ms and then scrolls to that message and clears the
   * midToScroll signal.
   */
  checkForScrolling() {
    if (this.scrollService.midToScroll().length > 0) {
      setTimeout(() => {
        this.scrollMessageIntoView(this.scrollService.midToScroll());
        this.scrollService.midToScroll.set('');
      }, 500)

    }
  }

  /**
   * Listens for changes in the messageItems QueryList and whenever the list
   * changes, it scrolls to the bottom of the message list.
   */
  ngAfterViewInit(): void {
    this.messageItems.changes.subscribe((messageObj) => {
      this.scrollToBottom(messageObj.first);
    });
  }

  /**
   * Scrolls to the message with the given mid and adds a class of 'active' to it
   * for 1.2 seconds. If no element with the given mid is found, it logs a message
   * to the console.
   * @param mid The id of the message to scroll to
   */
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

  /**
   * Scrolls to the given element. If the element is not given, nothing
   * happens.
   * @param elem The element to scroll to.
   */
  public scrollToBottom(elem: any) {
    if (elem)
      elem.scrollIntoView();
  }

  /**
   * Sanitizes the given url by marking it as trusted. This is needed because
   * Angular automatically sanitizes all URLs, which prevents links from being
   * clickable. This function is used to mark a URL as trusted, so that it can be
   * clicked on.
   * @param url The url to sanitize.
   * @returns The sanitized url.
   */
  public sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  /**
   * Formats the date of the message at the given index and checks if it is a
   * new date compared to the previous message. If it is a new date, it returns
   * true, otherwise it returns false.
   * @param index The index of the message to format the date of.
   * @returns Whether the date of the message is a new date.
   */
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

  /**
   * Checks if the given date is a new date compared to the previous message.
   * If the given date is different from the previous date or if it is the first
   * message in the list, it returns true, otherwise it returns false. This
   * function is used to check if the date of a message should be displayed.
   * @param date The date of the message to check.
   * @param index The index of the message in the list.
   * @returns Whether the date of the message is a new date.
   */
  private checkLatestDate(date: number, index: number): boolean {
    if (this.latestFormattedDate !== date || index === 0) {
      this.latestFormattedDate = date;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if the message at the given index has a new date compared to the
   * previous message. If the message is the first in the list, it resets the
   * date to null. If the message has a new date, it returns true, otherwise it
   * returns false.
   * @param index The index of the message to check.
   * @returns Whether the date of the message is a new date.
   */
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

  /**
   * Checks if the message at the given index should have a new date displayed.
   * @param index The index of the message to check.
   * @param isSameDay Whether the message has the same date as the previous message.
   * @returns Whether the message should have a new date displayed.
   */
  getIsNewDateResult(index: number, isSameDay: boolean): boolean {
    if (this.channelService.isChannelSet()) {
      return index === this.channelService.messages.length - 1 || !isSameDay;
    } else if (this.chat) {
      return index === this.chat.messages.length - 1 || !isSameDay;
    }
    return false;
  }

  /**
   * Returns the date of the message at the given index.
   * @param index The index of the message to get the date of.
   * @returns The date of the message at the given index, or null if the index is out of bounds.
   */
  getDate(index: number): Date | null {
    if (this.channelService.isChannelSet()) {
      return new Date(this.channelService.messages[index].timestamp);
    } else if (this.chat && index < this.chat.messages.length) {
      return new Date(this.chat.messages[index].timestamp);
    }
    return null;
  }

  /**
   * Returns the date of the next message after the one at the given index.
   * @param index The index of the message to get the date of the next message after.
   * @returns The date of the next message after the one at the given index, or null if the index is out of bounds.
   */
  getNextDate(index: number): Date | null {
    if (this.channelService.isChannelSet() && index < this.channelService.messages.length - 1) {
      return new Date(this.channelService.messages[index + 1].timestamp);
    } else if (this.chat && index < this.chat.messages.length - 1) {
      return new Date(this.chat.messages[index + 1].timestamp);
    }
    return null;
  }

  /**
   * Formats the given date into a string that is easy to read and
   * understandable for the user. If the date is today, it returns 'Heute'.
   * If the date is in the same year as the given now date, it returns the
   * date in the format 'EEEE, d MMMM'. If the date is not in the same year
   * as the given now date, it returns the date in the format 'EEEE, d MMMM, y'.
   * @param date The date to format.
   * @param now The date to compare the given date to.
   * @returns A string that is easy to read and understandable for the user.
   */
  getFormattedDate(date: Date, now: Date) {
    if (this.isToday(date)) {
      return 'Heute';
    } else if (date.getFullYear() === now.getFullYear()) {
      return this.pipe.transform(date, 'EEEE, d MMMM');
    } else {
      return this.pipe.transform(date, 'EEEE, d MMMM, y');
    }
  }

  /**
   * Checks if two given dates are on the same day.
   * @param date1 The first date to compare.
   * @param date2 The second date to compare.
   * @returns Whether the two given dates are on the same day.
   */
  isSameDay(date1: Date, date2: Date) {
    return date1 && date2 && date1.toDateString() === date2.toDateString();
  }

  /**
   * Checks if the given date is today.
   * @param date The date to check.
   * @returns Whether the given date is today.
   */
  isToday(date: Date) {
    return new Date().toDateString() === date.toDateString();
  }
}
