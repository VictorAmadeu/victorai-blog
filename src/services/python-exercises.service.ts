// Servicio Angular para gestionar los ejercicios de Python (catálogo y lectura de archivos).

// @Injectable: permite que esta clase se use como servicio inyectable en otros componentes/clases.
import { Injectable } from '@angular/core';

// HttpClient: cliente HTTP que usaremos para leer JSON y archivos .py desde assets/.
import { HttpClient } from '@angular/common/http';

// map: operador de RxJS que nos permite transformar el resultado de un observable.
import { map } from 'rxjs/operators';

// Observable: tipo de RxJS para manejar respuestas asincrónicas (peticiones HTTP).
import { Observable } from 'rxjs';

// ====== Interfaces (tipos) ======
// PythonFile: representa un archivo suelto (por ejemplo, un main.py dentro de una clase).
export interface PythonFile {
  nombre: string; // Nombre del archivo (ej.: "main.py").
  ruta: string; // Ruta relativa dentro de assets (ej.: "assets/python-exercises/clase-01/main.py").
}

// PythonExercise: representa un ejercicio completo, que puede tener varios archivos.
export interface PythonExercise {
  id: string; // Identificador único (ej.: "clase-01").
  titulo: string; // Título para mostrar en la tarjeta.
  descripcion: string; // Breve descripción del ejercicio.
  archivos: PythonFile[]; // Lista de archivos asociados a este ejercicio.
}

// ====== Servicio ======
@Injectable({ providedIn: 'root' }) // 'providedIn: root' → disponible en toda la app sin necesidad de registrarlo en providers.
export class PythonExercisesService {
  // URL del catálogo JSON con la lista de ejercicios.
  // Este archivo lo mantenemos en assets/python-exercises/exercises.json.
  private jsonUrl = 'assets/python-exercises/exercises.json';

  // Constructor: inyectamos HttpClient para poder usarlo en los métodos del servicio.
  constructor(private http: HttpClient) {}

  // Método listar():
  // - Devuelve un Observable con la lista completa de ejercicios.
  // - Usa HttpClient.get() tipado como PythonExercise[].
  listar(): Observable<PythonExercise[]> {
    return this.http.get<PythonExercise[]>(this.jsonUrl);
  }

  // Método obtener():
  // - Busca un ejercicio concreto por su id (ej.: "clase-01").
  // - Primero llama a listar() para obtener todos, y luego usa map() para encontrar el que coincida.
  obtener(id: string): Observable<PythonExercise | undefined> {
    return this.listar().pipe(
      map((arr) => arr.find((e) => e.id === id)) // Si no encuentra nada, devuelve undefined.
    );
  }

  // Método leerArchivoText():
  // - Carga un archivo .py como texto plano.
  // - Ejemplo: leerArchivoText("assets/python-exercises/clase-01/main.py").
  // - La opción { responseType: 'text' } indica que no queremos JSON, sino texto puro.
  leerArchivoText(ruta: string): Observable<string> {
    return this.http.get(ruta, { responseType: 'text' });
  }
}
