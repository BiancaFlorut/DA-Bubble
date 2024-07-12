import { Emoji } from "./emoji.class";


export class Message {
  text: string = '';
  timestamp: number = Date.now();
  editedTimestamp?: number;
  uid: string;
  mid: string;
  tid?: string;
  emojis: Emoji[] = [];
  isAnswer: boolean = false;
  answerCount: number = 0;
  lastAnswerTimestamp?: number;

  constructor(mid: string, uid: string, text: string, timestamp: number, emojis: Emoji[]) {
    this.emojis = emojis;
    this.uid = uid;
    this.text = text;
    this.timestamp = timestamp;
    this.mid = mid;
  }
}