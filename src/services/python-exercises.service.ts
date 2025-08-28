// Servicio Angular para gestionar los ejercicios de Python:
// - Lee el catálogo (exercises.json)
// - Lee el contenido de los .py como texto plano para pintarlos en la UI

// @Injectable: marca esta clase para inyección de dependencias.
import { Injectable } from '@angular/core';

// HttpClient: cliente HTTP para leer JSON y archivos desde /assets.
import { HttpClient } from '@angular/common/http';

// Operador map de RxJS para transformar flujos de datos.
import { map } from 'rxjs/operators';

// Observable: tipo base para manejar respuestas asíncronas.
import { Observable } from 'rxjs';

// ========= Interfaces (modelos de datos) =========

// Representa un archivo del ejercicio (p. ej., main.py).
export interface PythonFile {
  nombre: string; // Nombre visible (ej.: "main.py").
  ruta: string; // Ruta en /assets (ej.: "assets/python-exercises/clase-01/main.py").
  salida?: string; // ✅ OPCIONAL: texto de "salida esperada" que mostraremos bajo el código.
}

// Representa un ejercicio completo, con uno o varios archivos.
export interface PythonExercise {
  id: string; // Id único (también se usa en la URL: /python/:id).
  titulo: string; // Título mostrado en tarjetas y detalle.
  descripcion: string; // Breve descripción.
  archivos: PythonFile[]; // Archivos asociados a este ejercicio.
}

// ========= Servicio =========
@Injectable({ providedIn: 'root' }) // Disponible globalmente sin declararlo en providers.
export class PythonExercisesService {
  // Ruta del catálogo JSON servido estáticamente por Angular desde /assets.
  private readonly jsonUrl = 'assets/python-exercises/exercises.json';

  // Inyectamos HttpClient para realizar peticiones HTTP.
  constructor(private http: HttpClient) {}

  /**
   * Devuelve la lista completa de ejercicios del catálogo.
   * Tipamos como PythonExercise[] para autocompletado y seguridad de tipos.
   */
  listar(): Observable<PythonExercise[]> {
    return this.http.get<PythonExercise[]>(this.jsonUrl);
  }

  /**
   * Obtiene un ejercicio por su id.
   * Implementación simple: reutiliza listar() y hace un find en memoria.
   * Suficiente y legible para catálogos pequeños estáticos en /assets.
   */
  obtener(id: string): Observable<PythonExercise | undefined> {
    return this.listar().pipe(
      map((arr) => arr.find((e) => e.id === id)) // Si no existe → undefined.
    );
  }

  /**
   * Lee un archivo .py como TEXTO PLANO.
   *
   * ⚠️ Importante para evitar los errores TS2322/TS2769:
   *    - NO usar this.http.get<string>(...).
   *    - Forzar el overload de texto con: responseType: 'text' as 'text'
   *
   * Con esto, HttpClient devuelve Observable<string> (texto) y no intenta
   * usar el overload por defecto de JSON ni el de ArrayBuffer.
   */
  leerArchivoText(ruta: string): Observable<string> {
    return this.http.get(ruta, {
      responseType: 'text' as 'text', // ← fuerza a devolver texto (no JSON).
      // observe: 'body'             // (Opcional) también ayuda, pero no es necesario.
    });
  }
}
