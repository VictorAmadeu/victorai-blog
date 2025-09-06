// app.config.ts — Configuración global de la app en modo Standalone (sin NgModule)

// 1) ApplicationConfig define la forma de arrancar la app;
//    provideZoneChangeDetection optimiza el change detection en eventos;
//    importProvidersFrom permite “traer” NgModules al mundo Standalone.
import {
  ApplicationConfig, // Tipo del objeto de configuración global
  provideZoneChangeDetection, // Optimización de eventos para Zone.js
  importProvidersFrom, // Puente para importar NgModules
} from '@angular/core';

// 2) Router en Standalone: registramos el sistema de rutas de la app.
import { provideRouter } from '@angular/router'; // Provider del router
import { routes } from './app.routes'; // Array con las rutas de la app

// 3) HttpClient en Standalone: alta global del cliente HTTP (con Fetch API).
import {
  provideHttpClient, // Provider de HttpClient
  withFetch /* , withInterceptorsFromDi */, // Usa fetch(); descomenta para interceptores DI si los necesitas
} from '@angular/common/http';

// 4) Highlight.js (wrapper Angular) para resaltar código en los artículos.
import {
  HighlightModule, // NgModule con la directiva [highlight]
  HIGHLIGHT_OPTIONS, // Token para configurar carga perezosa
} from 'ngx-highlightjs';

// 5) ✅ Animaciones en Standalone (equivalente a BrowserAnimationsModule).
//    Necesario si usas triggers/transition/query/animate en componentes.
import { provideAnimations } from '@angular/platform-browser/animations';
//    Si no quisieras animaciones pero quieres evitar errores, podrías usar:
//    import { provideNoopAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  // 6) Exportamos la configuración que usará bootstrapApplication
  providers: [
    // --- Rendimiento de zona ---
    provideZoneChangeDetection({ eventCoalescing: true }), // Agrupa eventos para menos ciclos de CD

    // --- Router ---
    provideRouter(routes), // Activa el enrutador con el arreglo definido en app.routes.ts

    // --- HttpClient ---
    provideHttpClient(
      withFetch() // Usa la Fetch API del navegador (ideal con Vite y SSR)
      // , withInterceptorsFromDi() // ← Descomenta si defines interceptores vía DI
    ),

    // --- Highlight.js global ---
    importProvidersFrom(HighlightModule), // Importamos el NgModule dentro del mundo Standalone

    {
      // Configuramos cómo y qué lenguajes carga ngx-highlightjs
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'), // Carga perezosa del core
        languages: {
          python: () => import('highlight.js/lib/languages/python'), // Lenguaje imprescindible en tu blog
          // Puedes añadir más si lo necesitas:
          // typescript: () => import('highlight.js/lib/languages/typescript'),
          // json: () => import('highlight.js/lib/languages/json'),
        },
      },
    },

    // --- Animaciones ---
    provideAnimations(), // Habilita Angular Animations para las transiciones de rutas, etc.
    // Alternativa sin animaciones reales (desactiva transiciones):
    // provideNoopAnimations(),
  ],
};
