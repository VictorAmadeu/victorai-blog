// app.component.ts — Componente raíz (standalone) con:
// - Navbar accesible y botón “Mensajes”
// - Scroll suave a #contacto
// - Transiciones entre rutas (Angular Animations)

// 1) Component/Inject: definición base del componente y DI de tokens.
import { Component, Inject } from '@angular/core';

// 2) Router primitives: directivas para el template + Router para navegación programática.
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router,
} from '@angular/router';

// 3) DOCUMENT: acceso seguro al DOM (mejor que window/document directo para SSR/testing).
import { DOCUMENT } from '@angular/common';

// 4) Animations: utilidades para definir transiciones de rutas.
import {
  trigger,
  transition,
  style,
  animate,
  query,
  group,
} from '@angular/animations';

// 5) Bootstrap JS está cargado globalmente (angular.json -> scripts). Declaramos el símbolo.
declare const bootstrap: any;

/* 6) 👍 IMPORTANTE (fuera de este archivo):
   Asegúrate de habilitar animaciones en tu bootstrap (app.config.ts) con:
   import { provideAnimations } from '@angular/platform-browser/animations';
   export const appConfig: ApplicationConfig = {
     providers: [provideRouter(routes), provideAnimations()],
   };
*/

// 7) Definimos aquí las transiciones de rutas.
//    - Patrón "* <=> *": aplica a cualquier cambio de ruta.
//    - Hacemos que la vista saliente se desvanezca y suba ligeramente,
//      mientras la entrante aparece desde abajo con un fade-in.
export const routeTransitionAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    // 7.1) Preparamos elementos entrante y saliente.
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute', // las apilamos para la transición
          width: '100%', // ocupan todo el contenedor
          left: 0,
          top: 0,
        }),
      ],
      { optional: true }
    ),

    // 7.2) Estado inicial de la vista entrante (ligeramente desplazada y oculta).
    query(':enter', [style({ opacity: 0, transform: 'translateY(16px)' })], {
      optional: true,
    }),

    // 7.3) Animamos en paralelo la salida y la entrada.
    group([
      // 7.3.a) La vista saliente se desvanece y sube un poco.
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
      // 7.3.b) La vista entrante aparece y se coloca en su sitio.
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
  standalone: true, // 9) Componente standalone (sin AppModule).
  // 10) Importamos solo lo que el template necesita.
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html', // 11) Plantilla asociada.
  styleUrl: './app.component.scss', // 12) Hoja de estilos específica (prop. singular soportada).
  // 13) Registramos las animaciones definidas arriba para usarlas en el template.
  animations: [routeTransitionAnimations],
})
export class AppComponent {
  // 14) Año actual para el footer (evita lógica en la plantilla).
  currentYear = new Date().getFullYear();

  // 15) Inyectamos Router para navegación programática y DOCUMENT para acceder al DOM.
  constructor(
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  // 16) Utilidad: devuelve una "clave" de estado para la animación de rutas.
  //     - Usamos el path de la Route activa; si no existe, devolvemos 'root'.
  // Devuelve una clave de estado para la animación de rutas.
  // ✔️ Blindado para cuando el outlet NO está activado.
  prepareRoute(outlet: RouterOutlet | null): string {
    // Si el outlet no existe o aún no está activado, usa el estado 'root'
    if (!outlet || !outlet.isActivated) return 'root';

    // Ya activado: podemos leer con seguridad la ruta y/o sus datos
    const route = outlet.activatedRoute;
    const path = route.routeConfig?.path;
    const dataKey = route.snapshot.data?.['animation'];

    // Preferimos un path explícito; si no, una key en data; si no, 'root'
    return path ?? dataKey ?? 'root';
  }

  // 17) Menú hamburguesa: se cierra automáticamente a los 3s (móvil).
  autoCloseMenu(): void {
    setTimeout(() => {
      const navEl = this.document.getElementById('nav'); // 17.1) Contenedor colapsable.
      if (!navEl || typeof bootstrap === 'undefined') return; // 17.2) Si no existe, salimos.
      const collapse = bootstrap.Collapse.getOrCreateInstance(navEl); // 17.3) Instancia Collapse.
      collapse.hide(); // 17.4) Ocultamos el menú.
    }, 3000); // 17.5) Retraso de 3 segundos.
  }

  // 18) Cerrar el menú AHORA (sin esperar). Útil tras pulsar "Mensajes".
  private hideMenuNow(): void {
    const navEl = this.document.getElementById('nav'); // 18.1) Contenedor colapsable.
    if (!navEl || typeof bootstrap === 'undefined') return; // 18.2) Salimos si no hay precondiciones.
    const collapse = bootstrap.Collapse.getOrCreateInstance(navEl); // 18.3) Instancia Collapse.
    collapse.hide(); // 18.4) Ocultar ya.
  }

  // 19) Scroll suave a un id del DOM (con pequeños reintentos).
  private smoothScrollToId(id: string, tries = 20, delay = 50): void {
    const el = this.document.getElementById(id); // 19.1) Buscamos el elemento.
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' }); // 19.2) Scroll suave.
      return;
    }
    if (tries > 0) {
      // 19.3) Si no existe aún, reintentamos.
      setTimeout(() => this.smoothScrollToId(id, tries - 1, delay), delay);
    }
  }

  // 20) Handler del botón "Mensajes" del navbar.
  //     - Si ya estamos en Home: scroll directo a #contacto.
  //     - Si NO estamos en Home: navegamos a "/" y luego hacemos el scroll.
  goToContact(ev: MouseEvent): void {
    ev.preventDefault(); // 20.1) Evitamos seguir el href.
    this.hideMenuNow(); // 20.2) Cerramos menú móvil al instante.
    const path = this.router.url.split('?')[0].split('#')[0]; // 20.3) Ruta actual sin query/hash.
    const onHome = path === '/' || path === ''; // 20.4) ¿Estamos ya en Home?

    if (onHome) {
      this.smoothScrollToId('contacto'); // 20.5) Scroll directo si ya estamos en Home.
    } else {
      this.router.navigateByUrl('/').then(() => {
        setTimeout(() => this.smoothScrollToId('contacto'), 0); // 20.6) Esperamos un tick y scroll.
      });
    }
  }
}
// Fin de app.component.ts
