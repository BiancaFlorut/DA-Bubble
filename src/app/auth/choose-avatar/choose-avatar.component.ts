import { Component } from '@angular/core';
import { HandleCreateAccountService } from '../../serives/handle-create-account/handle-create-account.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
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
