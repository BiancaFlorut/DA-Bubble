
import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, computed, effect, inject, NgZone, QueryList, Signal, ViewChildren } from '@angular/core';
import { MessageComponent } from '../../active-chat/chat-body/message/message.component';
import { ThreadChatService } from '../../../services/chat/thread-chat/thread-chat.service';
import { Message } from '../../../models/message.class';

@Component({
  selector: 'app-thread-body',
  standalone: true,
  imports: [MessageComponent],
  templateUrl: './thread-body.component.html',
  styleUrl: './thread-body.component.scss'
})
export class ThreadBodyComponent implements AfterViewInit{
  @ViewChildren('messageItem') messageItems!: QueryList<any>;
  threadChatService = inject(ThreadChatService);
  messages: Message[] = [];
  applicationRef = inject(ApplicationRef);
  changeDetectorRef = inject(ChangeDetectorRef);

  /**
   * Initializes the component. Subscribes to the ThreadChatService's messages()
   * signal and updates the local messages array whenever it changes.
   */
  constructor() { 
    effect(() => {
      if (this.threadChatService.messages()) {
        this.messages = this.threadChatService.messages();
      }
    })
  }

  /**
   * Scrolls to the first message in the thread after the component has rendered
   */
  ngAfterViewInit(): void {
    if (this.messageItems && this.messageItems.first) this.messageItems.first.scrollIntoView();
  }

}
