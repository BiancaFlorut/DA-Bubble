import { Injectable } from '@angular/core';
import { ChatService } from '../chat.service';

@Injectable({
  providedIn: 'root'
})
export class DirectChatService extends ChatService{

  constructor() {
    super();
  }
}
