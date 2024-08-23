
import { AfterViewInit, ApplicationRef, Component, effect, inject, QueryList, ViewChildren } from '@angular/core';
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
  messages: Message[] = this.threadChatService.messages();
  applicationRef = inject(ApplicationRef);

  constructor() { 
    effect(() => {
      this.messages = this.threadChatService.messages();
      this.applicationRef.tick();
    })
  }

  ngAfterViewInit(): void {
    if (this.messageItems && this.messageItems.first) this.messageItems.first.scrollIntoView();
  }

}
