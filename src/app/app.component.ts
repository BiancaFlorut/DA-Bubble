import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public title = 'da_bubble';

  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    AOS.init();
    if (localStorage.getItem('loggedAsGuestOrGoogleUser')) {
      this.authService.user$
        .subscribe((user) => {
          if (user) {
            this.router.navigate([`main-page/${user.uid}`]);
          }
        });
    }
  }
}
