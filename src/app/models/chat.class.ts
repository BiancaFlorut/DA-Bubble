import { Message } from "./message.class";

export class Chat {
  cid: string = '';
  uids: string[] = [];
  messages: Message[];

  constructor(cid: string, uids: string[], messages: Message[]) {
    this.cid = cid;
    this.uids = uids;
    this.messages = messages;
  }
}