import { Component } from '@angular/core';
import { HandleCreateAccountService } from '../../serives/handle-create-account/handle-create-account.service';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  isLoginUrl!: boolean;
  isChecked: boolean = false;

  constructor(private handleCreateAccount: HandleCreateAccountService, private location: Location) {
    this.handleCreateAccount.isLoginUrlObservable.subscribe(value => {
      this.isLoginUrl = value;
    });
  }

  public handleIsLoginUrl(): void {
    this.handleCreateAccount.setBoolean(!this.isLoginUrl);
    this.location.back();
  }

  public handleCheckbox(): void {
    this.isChecked = !this.isChecked;
    // if (this.isChecked) {
    //   this.showErrorCheckbox = false;
    // }
  }
}
