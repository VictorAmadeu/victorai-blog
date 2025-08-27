// Componente de detalle: muestra un ejercicio y resalta el código .py

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Usamos RouterLink en el breadcrumb "Volver"
import { ActivatedRoute, RouterLink } from '@angular/router';

// Servicio y tipos (estás en src/app/pages/python-detail → sube 3 niveles)
import {
  PythonExercisesService,
  PythonExercise,
  PythonFile,
} from '../../../services/python-exercises.service';

// RxJS para orquestar cargas de varios archivos
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

// 👇 Importa la directiva [highlight] del wrapper ngx-highlightjs
import { HighlightModule } from 'ngx-highlightjs';

@Component({
  selector: 'app-python-detail',
  standalone: true, // Standalone component
  imports: [
    CommonModule, // *ngIf, *ngFor...
    RouterLink, // routerLink en el breadcrumb
    HighlightModule, // ✅ habilita la directiva [highlight] en la plantilla
  ],
  templateUrl: './python-detail.component.html',
  styleUrls: ['./python-detail.component.scss'],
})
export class PythonDetailComponent implements OnInit {
  // === Inyección de dependencias
  private readonly route = inject(ActivatedRoute);
  private readonly svc = inject(PythonExercisesService);

  // === Estado para la plantilla
  ejercicio?: PythonExercise; // Datos del ejercicio
  archivos: { nombre: string; codigo: string }[] = []; // Contenido de cada .py
  cargando = true; // Spinner/alerta
  error: string | null = null; // Mensaje de error

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((pm) => pm.get('id')),
        switchMap((id: string | null) => {
          if (!id) {
            this.error = 'Falta el parámetro "id" en la URL.';
            this.cargando = false;
            return of(null);
          }
          return this.svc.obtener(id);
        }),
        switchMap((ej: PythonExercise | undefined | null) => {
          if (!ej) {
            if (!this.error) this.error = 'Ejercicio no encontrado.';
            this.cargando = false;
            return of(null);
          }

          this.ejercicio = ej;

          const lecturas = ej.archivos.map((f: PythonFile) =>
            this.svc
              .leerArchivoText(f.ruta)
              .pipe(map((codigo: string) => ({ nombre: f.nombre, codigo })))
          );

          return lecturas.length
            ? forkJoin(lecturas)
            : of([] as { nombre: string; codigo: string }[]);
        }),
        catchError((err: unknown) => {
          console.error('Error cargando el ejercicio:', err);
          this.error = 'No se pudo cargar el contenido del ejercicio.';
          this.cargando = false;
          return of(null);
        })
      )
      .subscribe((archs: { nombre: string; codigo: string }[] | null) => {
        if (archs) this.archivos = archs;
        this.cargando = false;
      });
  }

  // trackBy para *ngFor
  trackByNombre(_i: number, f: { nombre: string; codigo: string }): string {
    return f.nombre;
  }
}
