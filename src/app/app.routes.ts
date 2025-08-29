// src/app/app.routes.ts

// 1) Importamos el tipo 'Routes' para definir la tabla de rutas de la app.
//    Usamos el enfoque Standalone de Angular (sin AppModule).
import { Routes } from '@angular/router';

// 2) Importaciones EAGER (carga inmediata):
//    Estas páginas se cargan al entrar en la app o al navegar a sus rutas.
//    Mantén EAGER lo que uses con mucha frecuencia (Home, Artículos...).
import { HomeComponent } from './pages/home/home.component'; // Página de inicio
import { ArticlesComponent } from './pages/articles/articles.component'; // Listado de artículos
import { AboutComponent } from './pages/about/about.component'; // Página "Sobre mí"

// 3) Sección Python (si ya la usas en tu sitio, dejamos carga EAGER para simplicidad).
import { PythonComponent } from './pages/python/python.component'; // Catálogo/listado de ejercicios
import { PythonDetailComponent } from './pages/python-detail/python-detail.component'; // Detalle ejercicio

// ⚠️ IMPORTANTE:
// - NO importamos CategoriesComponent ni CategoryPostsComponent aquí,
//   porque los cargaremos LAZY con loadComponent (se descargan sólo cuando se visitan).

// 4) Exportamos el arreglo de rutas que Angular usará para la navegación.
export const routes: Routes = [
  {
    // 4.1) Ruta raíz → Home (se muestra en https://tu-dominio/)
    path: '',
    component: HomeComponent,
  },
  {
    // 4.2) /articulos → listado de posts (EAGER)
    path: 'articulos',
    component: ArticlesComponent,
  },

  // 4.3) *** CATEGORÍAS – CARGA PEREZOSA (LAZY) ***
  {
    // /categorias → carga el componente SÓLO cuando se visita esta URL.
    path: 'categorias',
    // loadComponent devuelve una promesa que importa el componente de esa ruta.
    loadComponent: () =>
      import('./pages/categories/categories.component').then(
        (c) => c.CategoriesComponent
      ),
  },
  {
    // /categorias/:slug → lista posts de una categoría concreta (p. ej. /categorias/ingenieria-de-ia)
    path: 'categorias/:slug',
    loadComponent: () =>
      import('./pages/category-posts/category-posts.component').then(
        (c) => c.CategoryPostsComponent
      ),
  },

  {
    // 4.4) /sobre-mi → página estática (EAGER)
    path: 'sobre-mi',
    component: AboutComponent,
  },

  // 4.5) *** Sección Python (EAGER para mantenerlo simple de momento) ***
  {
    // /python → lista de ejercicios
    path: 'python',
    component: PythonComponent,
  },
  {
    // /python/:id → detalle de un ejercicio (ej.: /python/clase-01)
    path: 'python/:id',
    component: PythonDetailComponent,
    // :id corresponde al campo 'id' en tu JSON de ejercicios.
  },

  {
    // 4.6) Ruta comodín: cualquier ruta no conocida
    path: '**',
    // Redirige a Home (si prefieres, puedes llevar a /articulos)
    redirectTo: '',
    // Importante: la ruta comodín SIEMPRE debe ir la última.
  },
];
