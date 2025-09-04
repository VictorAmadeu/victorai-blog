// src/app/ui/skeleton/skeleton.component.ts
// Componente standalone para dibujar bloques "skeleton" reutilizables.
// Se apoya en la clase .skeleton que ya definiste en styles.scss.

import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'ui-skeleton', // Uso: <ui-skeleton height="200px" width="80%"></ui-skeleton>
  standalone: true, // No depende de NgModule
  imports: [NgStyle], // Para poder usar [ngStyle] en el template
  template: `
    <!-- Bloque visual del skeleton (aria-hidden porque es decorativo) -->
    <div
      class="skeleton d-block"
      [ngStyle]="{ height: height, width: width, 'border-radius': radius }"
      aria-hidden="true"
    ></div>
  `,
})
export class SkeletonComponent {
  // Alto del bloque (puede llevar 'px', 'rem', etc.)
  @Input() height: string = '1rem';
  // Ancho del bloque (por defecto 100%)
  @Input() width: string = '100%';
  // Radio de borde (redondeado)
  @Input() radius: string = '.5rem';
}
