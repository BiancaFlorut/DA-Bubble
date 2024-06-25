import { User } from "../interfaces/user";

export class Message {
  text: string = '';
  timestamp: number = Date.now();
  uid: string;
  constructor(uid: string, text: string, timestamp: number) {
    this.uid = uid;
    this.text = text;
    this.timestamp = timestamp;
  }
}