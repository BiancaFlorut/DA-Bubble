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
import { User } from '../../interfaces/user';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@angular/fire/storage';
import { GoogleAuthProvider, signInWithPopup, signOut, UserCredential } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public firebaseAuth: Auth = inject(Auth);

  private storage = getStorage();

  public user$ = user(this.firebaseAuth);
  public currentUserSig = signal<User | null | undefined>(undefined);

  public async uploadProfileImageTemp(file: File): Promise<string> {
    const storageRef = ref(this.storage, `temp/avatars/${Date.now()}_${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadResult.ref);
  }

  public async register(name: string, email: string, password: string, avatar: string): Promise<void> {
    await createUserWithEmailAndPassword(this.firebaseAuth, email, password);
    const user = this.firebaseAuth.currentUser;
    if (user) {
      updateProfile(user, {
        displayName: name,
        photoURL: avatar,
      });
    }
  }

  public async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.firebaseAuth, email, password);
  }

  public async logOut(): Promise<void> {
    await signOut(this.firebaseAuth);
  }

  public async updateUserName(name: string): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      await updateProfile(user, { displayName: name });
    }
  }

  public async updateUserEmail(email: string): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      await updateEmail(user, email);
    }
  }

  public async updateUserPhotoURL(photoURL: string): Promise<void> {
    const user = this.firebaseAuth.currentUser;
    if (user) {
      await updateProfile(user, { photoURL: photoURL });
    }
  }

  public async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(this.firebaseAuth, email);
  }

  public async resetPassword(code: string, newPassword: string): Promise<void> {
    await confirmPasswordReset(this.firebaseAuth, code, newPassword);
  }

  public async googleSignIn(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    return await signInWithPopup(this.firebaseAuth, provider);
  }
}