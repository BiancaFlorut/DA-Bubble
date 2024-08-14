import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router)
  private authService = inject(AuthService);

  public userForm!: FormGroup;
  public isPasswordMatch: boolean = true;
  public showResetMessage: boolean = false;

  private mode!: string;
  private oobCode!: string;
  private apiKey!: string;
  private lang!: string;

  ngOnInit() {
    this.setupPasswordForm();
    this.loadQueryParams();
  }

  private setupPasswordForm(): void {
    this.userForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]],
      newPassword: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
  }

  private loadQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['mode'];
      this.oobCode = params['oobCode'];
      this.apiKey = params['apiKey'];
      this.lang = params['lang'];
    });
  }

  public async updatePassword(): Promise<void> {
    if (this.userForm.get('password')?.value !== this.userForm.get('newPassword')?.value) {
      this.handleIsPasswordMatchMessage();
    } else if (this.userForm.valid) {
      let userPassword = this.userForm.get('password')?.value;
      if (this.oobCode && userPassword) {
        await this.authService.resetPassword(this.oobCode, userPassword)
          .then(() => {
            this.showMessage();
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  }

  private handleIsPasswordMatchMessage(): void {
    this.isPasswordMatch = false;
    setTimeout(() => {
      this.isPasswordMatch = true;
    }, 2000);
  }

  private showMessage(): void {
    this.showResetMessage = true;
    setTimeout(() => {
      this.showResetMessage = false;
      this.router.navigate(['./landing-page/login'])
    }, 2000);
  }
}