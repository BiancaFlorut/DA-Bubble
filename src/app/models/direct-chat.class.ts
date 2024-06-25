import { User } from "../interfaces/user";

export class DirectChat {
  cid: string = '';
  user!: User ;
  partner!: User;

  constructor(cid: string, user: User, partner: User) {
    this.cid = cid;
    this.user = user;
    this.partner = partner;
  }
}