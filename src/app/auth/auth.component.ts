import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HandleCreateAccountService } from '../serives/handle-create-account/handle-create-account.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isLoginUrl!: boolean;

  constructor(private handleCreateAccount: HandleCreateAccountService) {
    this.handleCreateAccount.isLoginUrlObservable.subscribe(value => {
      this.isLoginUrl = value;
    });
  }

  public handleIsLoginUrl(): void {
    this.handleCreateAccount.setBoolean(!this.isLoginUrl);
  }
}
