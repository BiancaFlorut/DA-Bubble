import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandleCreateAccountService {
  private isLoginUrl = new BehaviorSubject<boolean>(true);
  isLoginUrlObservable = this.isLoginUrl.asObservable();

  constructor() { }

  public setBoolean(value: boolean): void {
    this.isLoginUrl.next(value);
  }

  public getBoolean(): boolean {
    return this.isLoginUrl.value;
  }
}
