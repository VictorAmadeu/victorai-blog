// app.component.ts — Componente raíz (standalone) con:
// - Navbar accesible y botón “Mensajes”
// - Scroll suave a #contacto
// - Transiciones entre rutas (Angular Animations)
// - Botón flotante “Volver arriba” (<ui-scroll-top>)

// 1) Component/Inject: definición base del componente y DI de tokens.
import { Component, Inject } from '@angular/core';

// 1.1) CommonModule: habilita *ngIf/*ngFor en ESTE template raíz.
import { CommonModule } from '@angular/common';

// 2) Router primitives: directivas para el template + Router para navegación programática.
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router,
} from '@angular/router';

// 3) DOCUMENT: acceso seguro al DOM (útil para Bootstrap y scroll).
import { DOCUMENT } from '@angular/common';

// 4) Animations: utilidades para definir transiciones entre rutas.
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

// 5) ✅ Importa el botón flotante (STANDALONE) desde la ruta correcta.
import { UiScrollTopComponent } from './ui/scroll-top/scroll-top.component';

// 6) Bootstrap JS está cargado globalmente. Declaramos el símbolo para TypeScript.
declare const bootstrap: any;

/* 7) Transiciones de rutas:
   - Patrón "* <=> *": aplica a cualquier cambio.
   - Saliente: fade + leve subida; Entrante: fade-in desde abajo.
*/
export const routeTransitionAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // 7.1) Prepara entrante y saliente apilándolos.
    query(
      ':enter, :leave',
      [style({ position: 'absolute', width: '100%', left: 0, top: 0 })],
      { optional: true }
    ),

    // 7.2) Estado inicial de la vista entrante.
    query(':enter', [style({ opacity: 0, transform: 'translateY(16px)' })], {
      optional: true,
    }),

    // 7.3) Animaciones en paralelo.
    group([
      query(
        ':leave',
        [
          animate(
            '180ms ease-in',
            style({ opacity: 0, transform: 'translateY(-8px)' })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            '240ms 60ms ease-out',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
]);

@Component({
  selector: 'app-root', // 8) Selector del componente raíz.
  standalone: true, // 9) Standalone (sin AppModule).
  // 10) Importamos lo que usa el template.
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    UiScrollTopComponent,
  ],
  templateUrl: './app.component.html', // 11) Plantilla asociada.
  styleUrl: './app.component.scss', // 12) Estilos del componente.
  animations: [routeTransitionAnimations], // 13) Transiciones registradas.
})
export class AppComponent {
  // 14) Año actual para el footer.
  currentYear = new Date().getFullYear();

  // 15) Router para navegación y DOCUMENT para DOM/Bootstrap.
  constructor(
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  // 16) Clave de estado para la animación (segura cuando el outlet aún no está activo).
  prepareRoute(outlet: RouterOutlet | null): string {
    if (!outlet || !outlet.isActivated) return 'root';
    const route = outlet.activatedRoute;
    const path = route.routeConfig?.path;
    const dataKey = route.snapshot.data?.['animation'];
    return path ?? dataKey ?? 'root';
  }

  // 17) Cierra el menú hamburguesa automáticamente tras 3s.
  autoCloseMenu(): void {
    setTimeout(() => {
      const navEl = this.document.getElementById('nav');
      if (!navEl || typeof bootstrap === 'undefined') return;
      const collapse = bootstrap.Collapse.getOrCreateInstance(navEl);
      collapse.hide();
    }, 3000);
  }

  // 18) Cerrar el menú YA (cuando pulsas “Mensajes”).
  private hideMenuNow(): void {
    const navEl = this.document.getElementById('nav');
    if (!navEl || typeof bootstrap === 'undefined') return;
    const collapse = bootstrap.Collapse.getOrCreateInstance(navEl);
    collapse.hide();
  }

  // 19) Scroll suave a un id con pequeños reintentos (por si el DOM tarda un tick).
  private smoothScrollToId(id: string, tries = 20, delay = 50): void {
    const el = this.document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (tries > 0)
      setTimeout(() => this.smoothScrollToId(id, tries - 1, delay), delay);
  }

  // 20) “Mensajes”: si ya estás en Home → scroll a #contacto; si no → navega y luego scroll.
  goToContact(ev: MouseEvent): void {
    ev.preventDefault();
    this.hideMenuNow();
    const path = this.router.url.split('?')[0].split('#')[0];
    const onHome = path === '/' || path === '';
    if (onHome) {
      this.smoothScrollToId('contacto');
    } else {
      this.router.navigateByUrl('/').then(() => {
        setTimeout(() => this.smoothScrollToId('contacto'), 0);
      });
    }
  }
}
// Fin de app.component.ts
