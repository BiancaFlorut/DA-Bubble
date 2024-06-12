import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp({ "projectId": "dabubble-bf68c", "appId": "1:244168784753:web:1bde2e27e46dc290cd94d0", "storageBucket": "dabubble-bf68c.appspot.com", "apiKey": "AIzaSyB4VNMwgPi02CgsIe-gBiO6xRgBluHYfBE", "authDomain": "dabubble-bf68c.firebaseapp.com", "messagingSenderId": "244168784753" })),
    provideFirestore(() => getFirestore()),
    provideHttpClient()
  ]
};