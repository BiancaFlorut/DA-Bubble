import { Injectable, signal } from '@angular/core';
import { User } from '../../interfaces/user';
import { Channel } from '../../interfaces/channel';

@Injectable({
  providedIn: 'root'
})
export class NewMessageService {
  selectedUserChats = signal([] as User[]);
  selectedChannels = signal([] as Channel[]);

  constructor() { 
    
  }
}
