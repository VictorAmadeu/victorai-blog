// Botón flotante “Volver arriba” (standalone)
// - No depende de Bootstrap Icons (usa SVG inline)
// - CommonModule para *ngIf
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-scroll-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Solo se pinta si hay scroll suficiente -->
    <button
      class="scroll-top"
      *ngIf="visible"
      (click)="up()"
      type="button"
      aria-label="Volver arriba"
    >
      <!-- Flecha en SVG (evita dependencias externas) -->
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5l-7 7h4v7h6v-7h4z" fill="currentColor"></path>
      </svg>
    </button>
  `,
  styleUrls: ['./scroll-top.component.scss'],
})
export class UiScrollTopComponent {
  visible = false;

  // Se hace visible al pasar los 300px de scroll
  @HostListener('window:scroll')
  onScroll(): void {
    this.visible = window.scrollY > 300;
  }

  // Sube suave al principio
  up(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
