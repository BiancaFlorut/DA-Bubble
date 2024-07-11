import { AfterViewInit, Component, inject, QueryList, ViewChildren } from '@angular/core';
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

  ngAfterViewInit(): void {
    this.messageItems.changes.subscribe((messageObj) => {
      if (messageObj.first)
        messageObj.first.scrollIntoView();
    })
  }

}
