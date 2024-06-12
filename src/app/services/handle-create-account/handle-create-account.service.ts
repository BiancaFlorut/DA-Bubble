import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HandleCreateAccountService {
  public isLoginUrl: boolean = true;

  public setLogin(isLogin: boolean) {
    this.isLoginUrl = isLogin;
  }

  public getLogin() {
    return this.isLoginUrl;
  }
}
