// app.component.ts — Componente raíz (standalone) con scroll a #contacto bajo demanda

// 1) Component/Inject: definición del componente y DI de tokens.
import { Component, Inject } from '@angular/core';

// 2) RouterLink/RouterLinkActive/RouterOutlet: directivas de enrutado usadas en el HTML.
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router,
} from '@angular/router';

// 3) DOCUMENT: acceso seguro al DOM (evita usar window/document directamente).
import { DOCUMENT } from '@angular/common';

// 4) (Opcional) Servicio de Supabase ya no es necesario aquí para newsletter,
//    así que lo eliminamos de imports y del constructor.

// 5) Bootstrap JS está cargado globalmente (angular.json -> scripts). Declaramos el símbolo.
declare const bootstrap: any;

@Component({
  selector: 'app-root', // 6) Selector del componente raíz.
  standalone: true, // 7) Componente standalone (sin AppModule).
  // 8) Importamos solo lo que el template necesita: router y estado activo.
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.component.html', // 9) Plantilla asociada.
  styleUrl: './app.component.scss', // 10) Hoja de estilos específica.
})
export class AppComponent {
  // 11) Año actual para el footer (evita lógica en la plantilla).
  currentYear = new Date().getFullYear();

  // 12) Inyectamos Router para navegación programática y DOCUMENT para acceder al DOM.
  constructor(
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  // 13) Menú hamburguesa (comportamiento existente): se cierra automáticamente a los 3s.
  //     - Se sigue llamando desde el botón toggler del navbar.
  //     - Usa la API de Bootstrap Collapse.
  autoCloseMenu(): void {
    setTimeout(() => {
      const navEl = this.document.getElementById('nav'); // 13.1) Buscamos el contenedor colapsable.
      if (!navEl || typeof bootstrap === 'undefined') return; // 13.2) Si no existe o no hay Bootstrap, salimos.
      const collapse = bootstrap.Collapse.getOrCreateInstance(navEl); // 13.3) Obtenemos/creamos la instancia.
      collapse.hide(); // 13.4) Ocultamos el menú.
    }, 3000); // 13.5) Retraso de 3 segundos.
  }

  // 14) Cerrar el menú AHORA (sin esperar). Útil tras pulsar "Mensajes".
  //     - Si el menú está abierto en móvil, lo cerramos inmediatamente.
  private hideMenuNow(): void {
    const navEl = this.document.getElementById('nav'); // 14.1) Contenedor colapsable.
    if (!navEl || typeof bootstrap === 'undefined') return; // 14.2) Salimos si no hay precondiciones.
    const collapse = bootstrap.Collapse.getOrCreateInstance(navEl); // 14.3) Instancia Collapse.
    collapse.hide(); // 14.4) Ocultar ya.
  }

  // 15) Scroll suave a un id del DOM (con pequeños reintentos).
  //     - Útil si el contenido tarda milisegundos en renderizar.
  private smoothScrollToId(id: string, tries = 20, delay = 50): void {
    const el = this.document.getElementById(id); // 15.1) Buscamos el elemento.
    if (el) {
      // 15.2) Si existe...
      el.scrollIntoView({ behavior: 'smooth', block: 'start' }); // 15.3) ...scroll suave hasta él.
      return; // 15.4) Terminamos.
    }
    if (tries > 0) {
      // 15.5) Si no existe aún, reintentamos.
      setTimeout(() => this.smoothScrollToId(id, tries - 1, delay), delay);
    }
  }

  // 16) Handler del botón "Mensajes" del navbar.
  //     - Previene el comportamiento por defecto del <a>.
  //     - Cierra el menú en móvil inmediatamente.
  //     - Si ya estamos en Home, hace scroll directo a #contacto.
  //     - Si NO estamos en Home, navega a "/" y luego hace el scroll.
  goToContact(ev: MouseEvent): void {
    ev.preventDefault(); // 16.1) Evitamos seguir el href.
    this.hideMenuNow(); // 16.2) Cerramos menú móvil al instante.

    const path = this.router.url.split('?')[0].split('#')[0]; // 16.3) Ruta actual sin query ni hash.
    const onHome = path === '/' || path === ''; // 16.4) ¿Estamos ya en Home?

    if (onHome) {
      // 16.5) Sí: scroll directo.
      this.smoothScrollToId('contacto');
    } else {
      // 16.6) No: navegamos y luego scroll.
      this.router.navigateByUrl('/').then(() => {
        setTimeout(() => this.smoothScrollToId('contacto'), 0); // 16.7) Esperamos un tick y hacemos scroll.
      });
    }
  }
}
