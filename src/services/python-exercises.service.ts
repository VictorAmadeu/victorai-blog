// Servicio Angular para gestionar los ejercicios de Python:
// - Lee el catálogo (exercises.json)
// - Lee el contenido de los .py como texto plano

// @Injectable: permite usar esta clase como servicio inyectable.
import { Injectable } from '@angular/core';

// HttpClient: cliente HTTP para leer JSON y archivos desde /assets.
import { HttpClient } from '@angular/common/http';

// Operador map de RxJS para transformar flujos.
import { map } from 'rxjs/operators';

// Observable: tipo base para respuestas asíncronas (peticiones HTTP).
import { Observable } from 'rxjs';

// ========= Interfaces (modelos de datos) =========

// Representa un archivo del ejercicio (p. ej., main.py).
export interface PythonFile {
  nombre: string; // Nombre visible del archivo (ej.: "main.py").
  ruta: string; // Ruta dentro de /assets (ej.: "assets/python-exercises/clase-01/main.py").
  salida?: string; // ✅ OPCIONAL: texto con la "salida esperada" a mostrar bajo el código.
}

// Representa un ejercicio completo, que puede incluir varios archivos.
export interface PythonExercise {
  id: string; // Identificador único (se usa también en la URL: /python/:id).
  titulo: string; // Título mostrado en tarjetas y detalle.
  descripcion: string; // Descripción breve para contexto.
  archivos: PythonFile[]; // Lista de archivos asociados al ejercicio.
}

// ========= Servicio =========
@Injectable({ providedIn: 'root' }) // Disponible en toda la app sin declararlo en providers.
export class PythonExercisesService {
  // Ruta del catálogo JSON (servido de forma estática por Angular desde /assets).
  private readonly jsonUrl = 'assets/python-exercises/exercises.json';

  // Inyectamos HttpClient para poder realizar peticiones HTTP.
  constructor(private http: HttpClient) {}

  /**
   * Devuelve la lista completa de ejercicios del catálogo.
   * Tipamos la respuesta como PythonExercise[] para tener autocompletado y validación de tipos.
   */
  listar(): Observable<PythonExercise[]> {
    return this.http.get<PythonExercise[]>(this.jsonUrl);
  }

  /**
   * Obtiene un único ejercicio por su id.
   * Implementación simple: reutiliza listar() y hace un find en memoria.
   * (Para catálogos pequeños en /assets es suficiente y muy legible).
   */
  obtener(id: string): Observable<PythonExercise | undefined> {
    return this.listar().pipe(
      map((arr) => arr.find((e) => e.id === id)) // Si no lo encuentra → undefined.
    );
  }

  /**
   * Lee un archivo .py como TEXTO PLANO.
   * ⚠️ Claves para evitar el error de overload:
   *    - NO usar el genérico <string> en this.http.get(...).
   *    - Forzar el literal del overload correcto: responseType: 'text' as 'text'.
   * Con eso, HttpClient devuelve Observable<string> sin que TS lo confunda con 'json' o 'arraybuffer'.
   */
  leerArchivoText(ruta: string): Observable<string> {
    return this.http.get(ruta, {
      responseType: 'text' as 'text', // ← fuerza el overload de texto
      // observe: 'body'        // (opcional) también ayuda, pero no es necesario
    });
  }
}
