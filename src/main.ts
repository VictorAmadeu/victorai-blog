// main.ts — Punto de entrada de la app (Standalone Bootstrap)

// 1) bootstrapApplication: arranca la aplicación en modo standalone.
import { bootstrapApplication } from '@angular/platform-browser';

// 2) AppComponent: componente raíz de la aplicación.
import { AppComponent } from './app/app.component';

// 3) appConfig: configuración global (proveedores, router, etc.).
//    ⚠️ No añadimos lógica de scroll aquí: lo haremos sólo bajo clic del botón.
import { appConfig } from './app/app.config';

// 4) Arranque de la aplicación con la configuración existente.
bootstrapApplication(AppComponent, appConfig)
  // 5) Si algo falla al arrancar, lo mostramos en consola para depuración.
  .catch((err) => console.error(err));
