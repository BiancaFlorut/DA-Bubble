import { Message } from "./message.class";

export class Thread {
  cid: string = '';
  messages: Message[];

  constructor(cid: string, messages: Message[]) {
    this.cid = cid;
    this.messages = messages;
  }
}