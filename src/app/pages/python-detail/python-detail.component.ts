// Componente de detalle: muestra un ejercicio y, por cada archivo .py,
// renderiza el código con highlight + la salida esperada (texto de terminal).

// 1) Core de Angular: creación de componente, ciclo de vida e inyección moderna (inject).
import { Component, OnInit, inject } from '@angular/core';

// 2) Utilidades de Angular para plantillas: *ngIf, *ngFor, etc.
import { CommonModule } from '@angular/common';

// 3) Router: leemos el parámetro :id y usamos enlaces (breadcrumb "Python").
import { ActivatedRoute, RouterLink } from '@angular/router';

// 4) Servicio y modelos (este TS está en src/app/pages/python-detail → sube 3 niveles).
import {
  PythonExercisesService, // Servicio que lee el catálogo de ejercicios y los .py
  PythonExercise, // Tipo de un ejercicio (id, titulo, descripcion, archivos)
  PythonFile, // Tipo de un archivo (nombre, ruta, salida?)
} from '../../../services/python-exercises.service';

// 5) RxJS: combinamos lecturas en paralelo y encadenamos flujos de datos.
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

// 6) Highlight.js (wrapper Angular) para la directiva [highlight] usada en el HTML.
import { HighlightModule } from 'ngx-highlightjs';

// Tipo local que usaremos para pintar en la vista (código + salida opcional).
type ArchivoRender = { nombre: string; codigo: string; salida?: string };

@Component({
  selector: 'app-python-detail', // Nombre del selector (no imprescindible aquí).
  standalone: true, // ✅ Standalone: no depende de NgModule.
  imports: [
    CommonModule, // *ngIf, *ngFor, etc.
    RouterLink, // [routerLink] en el breadcrumb.
    HighlightModule, // Directiva [highlight] en la plantilla.
  ],
  templateUrl: './python-detail.component.html', // Vista asociada.
  styleUrls: ['./python-detail.component.scss'], // Estilos del detalle.
})
export class PythonDetailComponent implements OnInit {
  // ===== Inyección de dependencias con la API moderna "inject" =====
  private readonly route = inject(ActivatedRoute); // Para leer el :id de la URL.
  private readonly svc = inject(PythonExercisesService); // Para cargar catálogo y .py.

  // ===== Estado expuesto a la plantilla =====
  ejercicio?: PythonExercise; // Ejercicio actual (según :id).
  archivos: ArchivoRender[] = []; // Lista de archivos transformados: { nombre, codigo, salida? }.
  cargando = true; // Bandera de carga para mostrar spinner/alerta.
  error: string | null = null; // Mensaje de error para la UI.

  // ===== Ciclo de vida =====
  ngOnInit(): void {
    // Flujo: 1) Leemos :id → 2) buscamos el ejercicio → 3) leemos todos los .py en paralelo.
    this.route.paramMap
      .pipe(
        // 1) Extrae el id (string | null) desde el parámetro de ruta.
        map((pm) => pm.get('id')),

        // 2) Valida el id; si existe, obtiene el ejercicio desde el servicio.
        switchMap((id: string | null) => {
          if (!id) {
            this.error = 'Falta el parámetro "id" en la URL.';
            this.cargando = false;
            return of(null); // Cortamos el flujo devolviendo null.
          }
          return this.svc.obtener(id); // Observable<PythonExercise | undefined>.
        }),

        // 3) Con el ejercicio en mano, preparamos la lectura de todos sus archivos .py.
        switchMap((ej: PythonExercise | undefined | null) => {
          if (!ej) {
            if (!this.error) this.error = 'Ejercicio no encontrado.';
            this.cargando = false;
            return of(null);
          }

          // Guardamos el ejercicio para mostrar título/descripcion en la vista.
          this.ejercicio = ej;

          // Para cada archivo realizamos una petición HTTP que devuelve texto (el código del .py).
          const lecturas = ej.archivos.map((f: PythonFile) =>
            this.svc.leerArchivoText(f.ruta).pipe(
              // Transformamos la respuesta en el objeto que pintará la vista:
              // - codigo: el contenido del .py.
              // - salida: la salida esperada que viene desde el JSON (opcional).
              map(
                (codigo: string) =>
                  ({
                    nombre: f.nombre,
                    codigo,
                    salida: f.salida,
                  } as ArchivoRender)
              )
            )
          );

          // Si hay archivos, combinamos todas las lecturas en paralelo con forkJoin;
          // si no hay, devolvemos un array vacío.
          return lecturas.length
            ? forkJoin(lecturas)
            : of([] as ArchivoRender[]);
        }),

        // 4) Manejo de errores global del flujo (peticiones, JSON inválido, etc.).
        catchError((err: unknown) => {
          console.error('Error cargando el ejercicio:', err);
          this.error = 'No se pudo cargar el contenido del ejercicio.';
          this.cargando = false;
          return of(null);
        })
      )
      // 5) Suscripción final: guardamos los archivos y apagamos la bandera de carga.
      .subscribe((archs: ArchivoRender[] | null) => {
        if (archs) this.archivos = archs;
        this.cargando = false;
      });
  }

  // trackBy para *ngFor: evita repintados innecesarios usando el nombre como clave estable.
  trackByNombre(_i: number, f: ArchivoRender): string {
    return f.nombre;
  }
}
