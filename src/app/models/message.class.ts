import { User } from "../interfaces/user";

export class Message {
  text: string = '';
  timestamp: number = Date.now();
  editedTimestamp?: number;
  uid: string;
  mid: string;
  constructor(mid: string, uid: string, text: string, timestamp: number) {
    this.uid = uid;
    this.text = text;
    this.timestamp = timestamp;
    this.mid = mid;
  }
}