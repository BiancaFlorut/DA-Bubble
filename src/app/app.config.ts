import { ApplicationConfig, LOCALE_ID} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { routes } from './app.routes';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';

const firebaseConfig = {
  apiKey: "AIzaSyB4VNMwgPi02CgsIe-gBiO6xRgBluHYfBE",
  authDomain: "dabubble-bf68c.firebaseapp.com",
  projectId: "dabubble-bf68c",
  storageBucket: "dabubble-bf68c.appspot.com",
  messagingSenderId: "244168784753",
  appId: "1:244168784753:web:1bde2e27e46dc290cd94d0"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    { provide: LOCALE_ID, useValue: "de-DE" },
    DatePipe
  ]
};

registerLocaleData(localeDe, 'de-DE', localeDeExtra);
