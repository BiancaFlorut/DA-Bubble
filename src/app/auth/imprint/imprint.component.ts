import { Component } from '@angular/core';
import { HandleCreateAccountService } from '../../serives/handle-create-account/handle-create-account.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
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
