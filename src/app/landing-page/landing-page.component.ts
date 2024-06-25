import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { HandleCreateAccountService } from '../services/handle-create-account/handle-create-account.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  public isLoginUrl: boolean = true;

  private handleCreateAccount = inject(HandleCreateAccountService);
  private router = inject(Router);

  async ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/landing-page/login' || event.url === '/landing-page') {
          this.handleCreateAccount.setLogin(true);
        } else {
          this.handleCreateAccount.setLogin(false);
        }
        this.isLoginUrl = this.handleCreateAccount.getLogin();
      }
    });
  }
}
