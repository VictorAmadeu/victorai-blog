// Importamos utilidades básicas de Angular para crear componentes y utilizar DI (inyección de dependencias).
import { Component, OnInit, inject } from '@angular/core';

// CommonModule nos da *ngIf, *ngFor y directivas comunes usadas en el HTML.
import { CommonModule } from '@angular/common';

// RouterLink nos permite crear enlaces a rutas (p. ej., [routerLink]="['/python', e.id]").
import { RouterLink } from '@angular/router';

// ⛳ IMPORTANTE: Ajustamos la RUTA al servicio.
// Estás en: src/app/pages/python/python.component.ts
// El servicio está en: src/services/python-exercises.service.ts
// Por eso subimos 3 niveles: ../../../
import {
  PythonExercisesService, // Servicio que hace las peticiones HTTP.
  PythonExercise, // Tipo que describe cada ejercicio.
} from '../../../services/python-exercises.service';

@Component({
  selector: 'app-python', // Selector del componente.
  standalone: true, // ✅ Standalone: no depende de NgModule.
  imports: [
    CommonModule, // Necesario para *ngIf, *ngFor.
    RouterLink, // Para los enlaces [routerLink] en el HTML.
  ],
  templateUrl: './python.component.html', // Plantilla asociada (lista de tarjetas).
  styleUrls: ['./python.component.scss'], // Estilos específicos (¡ojo!: es styleUrls[]).
})
export class PythonComponent implements OnInit {
  // ====== Estado que usará la plantilla ======

  // Inyectamos el servicio con la API moderna "inject".
  private readonly svc = inject(PythonExercisesService);

  // Bandera para mostrar un aviso/spinner mientras se carga el catálogo.
  cargando = true;

  // Mensaje de error para la UI si algo falla al cargar.
  error: string | null = null;

  // Array de ejercicios que se pintará en las tarjetas.
  ejercicios: PythonExercise[] = [];

  // ====== Ciclo de vida ======

  // ngOnInit se ejecuta al inicializar el componente.
  ngOnInit(): void {
    // Pedimos el catálogo (lee assets/python-exercises/exercises.json).
    this.svc.listar().subscribe({
      // ✅ Tipamos 'data' para cumplir con TS estricto.
      next: (data: PythonExercise[]) => {
        this.ejercicios = data; // Guardamos el catálogo para el *ngFor del HTML.
        this.cargando = false; // Ocultamos el estado de carga.
      },
      // ✅ Tipamos 'err' como unknown (TS estricto).
      error: (err: unknown) => {
        console.error('Error cargando ejercicios', err); // Log técnico.
        // Mensaje didáctico para el usuario.
        this.error =
          'No se pudieron cargar los ejercicios. Revisa exercises.json y rutas de los .py.';
        this.cargando = false;
      },
    });
  }

  // trackBy para *ngFor: evita repintados innecesarios usando el 'id' como clave estable.
  trackById(_index: number, e: PythonExercise): string {
    return e.id;
  }
}
