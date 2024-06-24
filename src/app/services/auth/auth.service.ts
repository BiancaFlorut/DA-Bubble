import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithRedirect,
  updateEmail,
  updateProfile,
  user
} from '@angular/fire/auth';
import { User } from '../../interfaces/user';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { GoogleAuthProvider, signOut } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  firebaseAuth = inject(Auth);
  storage = getStorage();
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<User | null | undefined>(undefined);

  async uploadProfileImageTemp(file: File) {
    const storageRef = ref(this.storage, `temp/avatars/${Date.now()}_${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    return downloadURL;
  }

  async register(name: string, email: string, password: string, avatar: string) {
    await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
    const user = this.firebaseAuth.currentUser;
    if (user) {
      updateProfile(user, {
        displayName: name,
        photoURL: avatar,
      });
    }
  }

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  async logOut() {
    await signOut(this.firebaseAuth);
  }

  async updateUserName(name: string) {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      await updateProfile(user, { displayName: name });
    }
  }

  async updateUserEmail(email: string) {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      await updateEmail(user, email);
    }
  }

  async updateUserPhotoURL(photoURL: string) {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      await updateProfile(user, { photoURL: photoURL });
    }
  }

  async sendPasswordReset(email: string) {
    await sendPasswordResetEmail(this.firebaseAuth, email);
  }

  async resetPassword(code: string, newPassword: string) {
    await confirmPasswordReset(this.firebaseAuth, code, newPassword);
  }

  async googleSignIn() {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    await signInWithRedirect(this.firebaseAuth, provider);
  }

  async getRedirectResult() {
    const result = await getRedirectResult(this.firebaseAuth);
    return result;
  }
}