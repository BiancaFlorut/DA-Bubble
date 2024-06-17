import { Injectable, inject, signal } from '@angular/core';
import { Auth, confirmPasswordReset, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateEmail, updateProfile, user } from '@angular/fire/auth';
import { Observable, catchError, from, throwError } from 'rxjs';
import { User } from '../../interfaces/user';
import { signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  storage = getStorage();
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<User | null | undefined>(undefined);

  uploadProfileImageTemp(file: File): Observable<string> {
    const storageRef = ref(this.storage, `temp/avatars/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytes(storageRef, file).then(async (snapshot) => {
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });
    return from(uploadTask);
  }

  register(name: string, email: string, password: string, avatar: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(res =>
        updateProfile(res.user, {
          displayName: name,
          photoURL: avatar,
        }),
      );
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(() => { });
    return from(promise);
  }

  logOut(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  updateUserName(name: string): Observable<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const promise = updateProfile(user, {
        displayName: name
      });
      return from(promise);
    } else {
      return throwError(() => new Error('User not authenticated'));
    }
  }

  updateUserEmail(email: string): Observable<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      const promise = updateEmail(user, email);
      return from(promise);
    } else {
      return throwError(() => new Error('User not authenticated'));
    }
  }

  sendPasswordReset(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email);
    return from(promise).pipe(
      catchError((error) => {
        return throwError(() => new Error(`Error sending password reset email: ${error.message}`));
      })
    );
  }

  resetPassword(code: string, newPassword: string): Observable<void> {
    if (code && newPassword) {
      const promise = confirmPasswordReset(this.firebaseAuth, code, newPassword);
      return from(promise);
    } else {
      return throwError(() => new Error('Code oder neues Passwort nicht angegeben'));
    }
  }
}