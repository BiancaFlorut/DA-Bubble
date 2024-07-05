import { Message } from "./message.class";

export class Thread {
  mid: string = '';
  messages: Message[];

  constructor(mid: string, messages: Message[]) {
    this.mid = mid;
    this.messages = messages;
  }
}