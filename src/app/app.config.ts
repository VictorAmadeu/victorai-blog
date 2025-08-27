// app.config.ts — Configuración global de la app en modo Standalone (sin NgModule)

// 1) ApplicationConfig define los providers globales.
//    provideZoneChangeDetection optimiza la detección de cambios.
//    importProvidersFrom permite "traer" un NgModule a Standalone (lo usaremos para HighlightModule).
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  importProvidersFrom,
} from '@angular/core';

// 2) Router en Standalone: registramos el enrutador con el arreglo de rutas.
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 3) HttpClient en Standalone: usamos provideHttpClient.
//    withFetch() hace que HttpClient use la API Fetch (ideal con Vite).
import {
  provideHttpClient,
  withFetch /* , withInterceptorsFromDi */,
} from '@angular/common/http';

// 4) Highlight.js (wrapper Angular).
//    - HighlightModule es un NgModule; lo "inyectamos" con importProvidersFrom.
//    - HIGHLIGHT_OPTIONS nos permite registrar qué lenguajes cargar (aquí, Python).
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

    // --- Highlight.js (GLOBAL) ---
    // Importamos el NgModule de ngx-highlightjs dentro del mundo Standalone.
    importProvidersFrom(HighlightModule),

    // Configuramos los lenguajes que queremos cargar de forma perezosa.
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        languages: {
          // Carga bajo demanda del lenguaje Python para reducir el bundle.
          // La función devuelve una promesa con el módulo del lenguaje.
          python: () => import('highlight.js/lib/languages/python'),
        },
      },
    },
  ],
};
