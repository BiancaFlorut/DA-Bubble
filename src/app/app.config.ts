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
import { firebaseConfig } from '../environments/environment';



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => {
      const auth = getAuth();
      // connectAuthEmulator(auth, "http://127.0.0.1:9099");
      return auth;
    }),
    provideFirestore(() => {
      const db = getFirestore();
      // connectFirestoreEmulator(db, '127.0.0.1', 8080);
      return db;
    }),
    { provide: LOCALE_ID, useValue: "de-DE" },
    DatePipe
  ]
};

registerLocaleData(localeDe, 'de-DE', localeDeExtra);