import { increment } from "firebase/firestore";

export class Emoji {
  index: number | undefined;
  count: number = 0;

  increment() {
    this.count++;
  }
}