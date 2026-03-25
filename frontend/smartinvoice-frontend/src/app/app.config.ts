import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';           // ← NEW
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // ← NEW

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),                    
    provideAnimationsAsync()    
  ]
};