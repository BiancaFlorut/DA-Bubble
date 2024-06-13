import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { onSnapshot } from 'firebase/firestore';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';

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
  private firebase: FirebaseService = inject(FirebaseService);
  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router)

  public createdUser!: User;
  public userForm!: FormGroup;
  public isPasswordMatch: boolean = true;
  public userId!: string;
  public showResetMessage: boolean = false;

  ngOnInit() {
    this.userForm = this.fb.group({
      password: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]],
      newPassword: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
    this.getUser();
  }

  public getUser() {
    this.route.params.subscribe((params) => {
      return onSnapshot(this.firebase.getUsers(), (users) => {
        users.forEach((user) => {
          if (user.id === params['id']) {
            this.userId = params['id'];
            this.createdUser = { ...user.data() } as User;
          }
        });
      });
    });
  }

  public updatePassword() {
    if (this.userForm.get('password')?.value !== this.userForm.get('newPassword')?.value) {
      this.handleIsPasswordMatchMessage();
    } else if (this.userForm.valid) {
      this.createdUser.password = this.userForm.get('password')?.value;
      this.firebase.updateUser(this.createdUser, this.userId);
      this.showMessage();
    }
  }

  private handleIsPasswordMatchMessage() {
    this.isPasswordMatch = false;
    setTimeout(() => {
      this.isPasswordMatch = true;
    }, 2000);
  }

  private showMessage() {
    this.showResetMessage = true;
    setTimeout(() => {
      this.showResetMessage = false;
      this.router.navigate(['./landing-page/login'])
    }, 2000);
  }
}