// 1) Importamos Component e Input para crear el componente y recibir props.
//    Añadimos ChangeDetectionStrategy para optimizar renders.
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

// 2) Importamos NgIf porque en el template usamos la directiva estructural *ngIf.
import { NgIf } from '@angular/common';

// 3) Tipado para la variante visual del botón (coincide con tus estilos .--primary, .--secondary, .--ghost).
type Variant = 'primary' | 'secondary' | 'ghost';

@Component({
  selector: 'ui-button', // 4) Uso: <ui-button>…</ui-button>
  standalone: true, // 5) Standalone (sin NgModule)
  imports: [NgIf], // 6) Habilita *ngIf en este template
  template: `
    <!-- Botón con clases atómicas y variantes por clase dinámica -->
    <button
      class="ui-btn"
      [class.--primary]="variant === 'primary'"
      [class.--secondary]="variant === 'secondary'"
      [class.--ghost]="variant === 'ghost'"
      [disabled]="disabled"
      [attr.aria-busy]="busy ? 'true' : null"
      type="button"
    >
      <!-- Indicador de carga: solo se pinta si busy === true -->
      <span class="spinner" *ngIf="busy" aria-hidden="true"></span>
      <!-- Contenido proyectado (texto/ícono pasado por el padre) -->
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./ui-button.component.scss'], // 7) Estilos específicos del botón
  changeDetection: ChangeDetectionStrategy.OnPush, // 8) Mejor rendimiento
})
export class UiButtonComponent {
  // 9) Variante visual del botón (por defecto, 'primary')
  @Input() variant: Variant = 'primary';

  // 10) Estado disabled del botón
  @Input() disabled = false;

  // 11) Estado busy (muestra spinner y aria-busy)
  @Input() busy = false;
}
