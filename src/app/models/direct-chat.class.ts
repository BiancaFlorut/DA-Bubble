import { User } from "../interfaces/user";
import { Message } from "./message.class";

export class DirectChat {
  cid: string = '';
  user!: User ;
  partner!: User;
  messages: Message[];

  constructor(cid: string, user: User, partner: User, messages: Message[]) {
    this.cid = cid;
    this.user = user;
    this.partner = partner;
    this.messages = messages;
  }
}