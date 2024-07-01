import { Emoji } from "./emoji.class";


export class Message {
  text: string = '';
  timestamp: number = Date.now();
  editedTimestamp?: number;
  uid: string;
  mid: string;
  emojis: Emoji[] = [];

  constructor(mid: string, uid: string, text: string, timestamp: number, emojis: Emoji[]) {
    this.emojis = emojis;
    this.uid = uid;
    this.text = text;
    this.timestamp = timestamp;
    this.mid = mid;
  }
}