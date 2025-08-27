// Importamos el tipo 'Routes' para definir la tabla de rutas de la app (enfoque Standalone de Angular)
import { Routes } from '@angular/router';

// Importamos los componentes de las páginas existentes
import { HomeComponent } from './pages/home/home.component'; // Página de inicio
import { ArticlesComponent } from './pages/articles/articles.component'; // Listado de artículos
import { CategoriesComponent } from './pages/categories/categories.component'; // Listado de categorías
import { AboutComponent } from './pages/about/about.component'; // Página "Sobre mí"

// Importamos los nuevos componentes para la sección de Python
import { PythonComponent } from './pages/python/python.component'; // Listado de ejercicios Python
import { PythonDetailComponent } from './pages/python-detail/python-detail.component'; // Detalle de un ejercicio

// Exportamos el arreglo de rutas que Angular usará para la navegación
export const routes: Routes = [
  {
    path: '', // Ruta vacía → raíz del sitio (ej. https://tudominio.vercel.app/)
    component: HomeComponent, // Renderiza la Home
  },
  {
    path: 'articulos', // URL: /articulos
    component: ArticlesComponent, // Muestra el listado de artículos
  },
  {
    path: 'categorias', // URL: /categorias
    component: CategoriesComponent, // Muestra las categorías
  },
  {
    path: 'sobre-mi', // URL: /sobre-mi
    component: AboutComponent, // Muestra la página "Sobre mí"
  },

  // *** Sección Python ***
  {
    path: 'python', // URL: /python
    component: PythonComponent, // Muestra el catálogo/listado de ejercicios
  },
  {
    path: 'python/:id', // URL: /python/<id> (ej.: /python/clase-01)
    component: PythonDetailComponent, // Muestra el detalle del ejercicio indicado por :id
    // Nota: :id corresponde al campo 'id' de tu JSON (p.ej., "clase-01", "clase-04")
  },

  {
    path: '**', // Cualquier ruta no conocida
    redirectTo: '', // Redirige a la Home (si prefieres, podrías llevar a /articulos)
    // Importante: esta ruta comodín debe ir SIEMPRE la última
  },
];
