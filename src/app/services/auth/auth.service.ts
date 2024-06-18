import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateEmail,
  updateProfile,
  user
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';
import { User } from '../../interfaces/user';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { GoogleAuthProvider, UserCredential, signInWithRedirect, signOut } from 'firebase/auth';
import { User as FirebaseAuthUser } from '@firebase/auth';

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
    const uploadTask = uploadBytes(storageRef, file)
    .then(async (snapshot) => {
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    }).catch((error) => {
      console.error('Error uploading profile image:', error);
      return Promise.reject('Error uploading profile image. Please try again.');
    });
    return from(uploadTask);
  }

  register(email: string, password: string): Observable<UserCredential> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
    return from(promise);
  }

  login(email: string, password: string): Observable<UserCredential> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password);
    return from(promise);
  }

  logOut(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }

  updateUserName(user: FirebaseAuthUser, name: string): Observable<void> {
    const promise = updateProfile(user, { displayName: name })
    return from(promise);
  }

  updateUserEmail(user: FirebaseAuthUser, email: string): Observable<void> {
    const promise = updateEmail(user, email);
    return from(promise);
  }

  sendPasswordReset(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email)
    return from(promise);
  }

  resetPassword(code: string, newPassword: string): Observable<void> {
    const promise = confirmPasswordReset(this.firebaseAuth, code, newPassword)
    return from(promise);
  }

  googleSignIn() {
    const provider = new GoogleAuthProvider();
    const promise = signInWithRedirect(this.firebaseAuth, provider)
    return from(promise);
  }
}