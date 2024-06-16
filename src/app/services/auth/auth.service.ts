import { Injectable, inject, signal } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, updateProfile, user } from '@angular/fire/auth';
import { Observable, from, throwError } from 'rxjs';
import { User } from '../../interfaces/user';
import { EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<User | null | undefined>(undefined);

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

  //   updateEmail(newName: string, newEmail: string, password: string): Observable<void> {
  //     const user = this.firebaseAuth.currentUser;
  //     if (!user) {
  //       throw new Error('User not authenticated');
  //     }
  //     const credential = EmailAuthProvider.credential(user.email!, password);
  //     const promise = reauthenticateWithCredential(user, credential)
  //       .then(() => updateEmail(user, newEmail))
  //       .then(() => {
  //         // Update the signal after email change
  //         this.currentUserSig.set({
  //           ...this.currentUserSig()!,
  //           name: newName,
  //           email: newEmail,
  //         });
  //       });
  //     return from(promise);
  //   }
  // }

  //   updateEmail(newName: string, newEmail: string): Observable<void> {
  //     const user = this.firebaseAuth.currentUser;
  //     if (!user) {
  //       throw new Error('User not authenticated');
  //     }

  //     return from(updateEmail(user, newEmail).then(() => {
  //       const currentUser = this.currentUserSig();
  //       this.currentUserSig.set({
  //         ...currentUser!,
  //         name: newName,
  //         email: newEmail
  //       });
  //     }));
  //   }
  // }

  updateEmail(newName: string, newEmail: string): Observable<void> {
    const user = this.firebaseAuth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Überprüfen, ob die neue E-Mail-Adresse bereits verifiziert ist
    if (!user.emailVerified) {
      return throwError('New email address is not verified');
    }

    // Firebase aktualisiert die E-Mail-Adresse nur, wenn sie bereits verifiziert ist
    return from(updateEmail(user, newEmail).then(() => {
      const currentUser = this.currentUserSig();
      this.currentUserSig.set({
        ...currentUser!,
        name: newName,
        email: newEmail
      });
    }));
  }
}

// updateEmail(newEmail: string): Observable<void> {
//   const user = this.firebaseAuth.currentUser;
//   if (!user) {
//     throw new Error('User not authenticated');
//   }

//   // Überprüfen, ob die neue E-Mail-Adresse bereits verifiziert ist
//   if (!user.emailVerified) {
//     // Wenn die E-Mail-Adresse nicht verifiziert ist, wird eine Fehlermeldung zurückgegeben
//     return throwError('New email address is not verified');
//   }

//   // Firebase aktualisiert die E-Mail-Adresse nur, wenn sie bereits verifiziert ist
//   return from(updateEmail(user, newEmail).then(() => {
//     const currentUser = this.currentUserSig();
//     this.currentUserSig.set({
//       ...currentUser!,
//       email: newEmail
//     });
//   }));
// }
