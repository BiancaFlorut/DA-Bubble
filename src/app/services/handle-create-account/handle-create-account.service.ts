import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandleCreateAccountService {
  private isLoginUrl = new BehaviorSubject<boolean>(true);
  public isLoginUrlObservable = this.isLoginUrl.asObservable();

  constructor() { }

  public setBoolean(value: boolean) {
    this.isLoginUrl.next(value);
  }

  public getBoolean() {
    return this.isLoginUrl.value;
  }
}
