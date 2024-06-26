import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { ChatService } from '../../../services/chat/chat.service';
import { DirectChat } from '../../../models/direct-chat.class';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-chat-body',
  standalone: true,
  imports: [DatePipe ],
  templateUrl: './chat-body.component.html',
  styleUrl: './chat-body.component.scss'
})
export class ChatBodyComponent implements AfterViewInit{
  @ViewChild('scrollSection') scrollSection!: ElementRef;
  @ViewChildren('messageItem') messageItems!: QueryList<any>;
  chatService = inject(ChatService);
  chat!: DirectChat;
  domSanitizer = inject(DomSanitizer);

  constructor() {
    this.chatService.currentChat.subscribe(chat => {
      if (chat) {
        this.chat = chat;
        this.chat.messages = chat.messages.sort((a, b) => a.timestamp - b.timestamp);
        this.chat.messages = this.chat.messages.reverse();
      }
    })
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
}
