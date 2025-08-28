// app.config.ts — Configuración global de la app en modo Standalone (sin NgModule)

// 1) ApplicationConfig: define los providers globales para bootstrapApplication.
//    provideZoneChangeDetection: pequeñas optimizaciones de cambio de zona.
//    importProvidersFrom: permite "traer" un NgModule al mundo Standalone.
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';

// 2) Router en Standalone: registramos el enrutador con el arreglo de rutas.
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 3) HttpClient en Standalone: alta global del cliente HTTP.
//    withFetch(): usa la API Fetch del navegador (ideal si trabajas con Vite).
import {
  provideHttpClient,
  withFetch /* , withInterceptorsFromDi */,
} from '@angular/common/http';

// 4) Highlight.js (wrapper Angular).
//    - HighlightModule: directiva [highlight] y utilidades.
//    - HIGHLIGHT_OPTIONS: dónde registramos cómo cargar el core y los lenguajes.
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

// 5) Exportamos la configuración que bootstrapApplication(AppComponent, appConfig) usará en main.ts.
export const appConfig: ApplicationConfig = {
  providers: [
    // --- Rendimiento de zona ---
    // Agrupa múltiples eventos en un único ciclo de detección → menos trabajo para el change detection.
    provideZoneChangeDetection({ eventCoalescing: true }),

    // --- Router ---
    // Activa el sistema de rutas con el array definido en app.routes.ts.
    provideRouter(routes),

    // --- HttpClient ---
    // Habilita HttpClient a nivel global. Si necesitas interceptores, añade withInterceptorsFromDi().
    provideHttpClient(
      withFetch()
      // , withInterceptorsFromDi()
    ),

    // --- Highlight.js global ---
    // Importamos el NgModule de ngx-highlightjs dentro del mundo Standalone para usar [highlight].
    importProvidersFrom(HighlightModule),

    // ⚠️ Registro del CORE + lenguajes.
    // Si no cargas el core de highlight.js, aparece el error:
    // "[HLJS] The core library was not imported!"
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        // Carga perezosa del CORE de highlight.js
        coreLibraryLoader: () => import('highlight.js/lib/core'),

        // Lenguajes que queremos registrar (mínimo Python en tu caso).
        languages: {
          python: () => import('highlight.js/lib/languages/python'),
          // Puedes añadir más si los necesitas:
          // typescript: () => import('highlight.js/lib/languages/typescript'),
          // json: () => import('highlight.js/lib/languages/json'),
        },
      },
    },
  ],
};
