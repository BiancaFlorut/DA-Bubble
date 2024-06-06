import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { HandleCreateAccountService } from '../../serives/handle-create-account/handle-create-account.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  isLoginUrl!: boolean;

  constructor(private handleCreateAccount: HandleCreateAccountService, private location: Location) {
    this.handleCreateAccount.isLoginUrlObservable.subscribe(value => {
      this.isLoginUrl = value;
    });
  }

  public handleIsLoginUrl(): void {
    this.handleCreateAccount.setBoolean(!this.isLoginUrl);
    this.location.back();
  }
}
