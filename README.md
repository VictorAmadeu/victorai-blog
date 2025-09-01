# VictorAI Blog

VictorAI Blog es un proyecto de blog personal desarrollado con Angular 19. Está pensado como un ejercicio práctico para recorrer el roadmap de aprendizaje en inteligencia artificial y desarrollo web. Utiliza Supabase como backend para almacenar artículos, categorías y suscriptores a la newsletter, y se estiliza con Bootstrap para obtener un diseño responsivo.

El sitio se construye como una Single Page Application (SPA) que puede desplegarse en Vercel u otros proveedores de hosting estático[1]. Además de posts, incluye una sección de ejercicios de Python con código resaltado y salidas esperadas.

## Características principales

### Arquitectura Angular standalone

El proyecto usa Angular 19 con standalone components en lugar de NgModules, lo que simplifica la modularidad y la carga perezosa. El archivo de rutas `app.routes.ts` define cada vista: la ruta raíz ('') para la portada, `/articulos` para el listado de posts, `/categorias` y `/categorias/:slug` para las categorías (carga perezosa), `/sobre‑mi` para una página estática y `/python//python/:id` para los ejercicios de Python[2].

Los estilos globales y scripts de Bootstrap se declaran en `angular.json`: se incluye `bootstrap.min.css` y el bundle de JavaScript de Bootstrap, así como los propios estilos en `src/styles.scss`[3].

El uso de componentes standalone se observa en todos los archivos de páginas (HomeComponent, ArticlesComponent, etc.), que importan sólo los módulos que necesitan y se declaran con `standalone: true`[4]. Esto reduce la complejidad y mejora los tiempos de carga.

### Gestión de datos con Supabase

En `supabase.service.ts` se inicializa un cliente de Supabase usando las credenciales definidas en `environment`. Se configuran cabeceras globales para las peticiones REST y se evita la persistencia de sesión, ya que sólo se utilizan las APIs públicas[5].

El servicio expone métodos para diversas operaciones: `addSubscriber()` inserta un correo en la tabla `newsletter_subscribers` y maneja errores, como la violación de unicidad del campo `email`[6]; `getPosts()` y `getLatestPosts()` obtienen la lista de artículos ordenada por fecha[7]; `addPost()` permite añadir un artículo nuevo, incluso con imagen de portada[8]; `getCategories()` devuelve las categorías ordenadas alfabéticamente[9]; `getCategoryBySlug()` y `getPostsByCategory()` recuperan los datos de una categoría concreta y sus artículos[10].

### Sección de artículos

El componente Home consulta los últimos posts mediante `getLatestPosts()` y los muestra en tarjetas en la portada[11]. Incluye también un formulario de suscripción a la newsletter que valida, normaliza el email y muestra mensajes de éxito o error (por ejemplo, cuando el correo ya está suscrito)[6].

El componente Articles carga hasta 50 entradas desde Supabase y emplea el pipe `stripMarkdown` para generar un extracto limpio sin sintaxis Markdown[12]. Los posts se listan con la fecha de creación y un badge con el slug de la categoría.

### Categorías

`Categories` se carga de forma perezosa. El componente `CategoriesComponent` realiza la consulta a Supabase para obtener todas las categorías y gestiona los estados de carga y error[13].

En `CategoryPosts`, el slug de la URL se lee con `ActivatedRoute` y se realizan dos peticiones en paralelo: una para obtener el nombre real de la categoría y otra para sus artículos. Ambos resultados se combinan y se actualiza la vista con el título y los posts[14]. La utilidad `slugToTitle()` convierte el slug en un título legible, manejando conectores y acrónimos[15].

### Sección de Python

La carpeta `src/assets/python-exercises` contiene un catálogo JSON (`exercises.json`) con ejercicios de Python. Cada elemento define un `id`, `titulo`, `descripcion` y una lista de archivos `.py` con su ruta y salida esperada[16].

`PythonExercisesService` lee ese catálogo mediante `HttpClient` y ofrece métodos `listar()`, `obtener(id)` y `leerArchivoText()`, que devuelve el contenido de cada archivo como texto plano[17][18].

`PythonComponent` lista los ejercicios disponibles y muestra un spinner mientras se cargan[19].

`PythonDetailComponent` obtiene un ejercicio por `id`, lee todos sus archivos `.py` en paralelo mediante `forkJoin` y utiliza la directiva `[highlight]` de `ngx-highlightjs` para resaltar el código. También muestra la salida esperada debajo de cada código[20].

### Renderizado seguro de Markdown

El pipe `markdown` transforma el contenido en Markdown a HTML y lo sanitiza con DOMPurify para prevenir ataques XSS[21]. El motor Markdown configurado (`marked`) se ejecuta de manera síncrona y activa compatibilidad con GitHub Flavored Markdown[22].

Para mostrar extractos, el pipe `stripMarkdown` elimina bloques de código, imágenes, enlaces y símbolos de Markdown, devolviendo texto plano limpio[23].

### Newsletter

En la portada se ofrece un formulario para suscribirse a la newsletter. El método `addSubscriber()` registra el email en Supabase y gestiona casos como duplicados (código de error `23505`) mostrando mensajes claros al usuario[6].

### Pruebas y calidad

El proyecto está configurado para ejecutar pruebas unitarias con Karma y Jasmine. Se pueden lanzar con:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

[24]

### Despliegue como SPA

El archivo `vercel.json` indica a Vercel que trate la aplicación como una SPA. Cualquier ruta que no coincida con un archivo físico se redirige a `index.html`[1].

Tras compilar el proyecto con `npm run build`, los artefactos de producción se encuentran en el directorio `dist/victorai-blog`[25]. Ese directorio puede desplegarse en cualquier hosting estático.

## Requisitos previos

- Node.js versión 18 o superior y npm 9 o superior[26].
- (Opcional) CLI de Angular instalado globalmente: `npm install -g @angular/cli`[27].

## Instalación

Clona este repositorio y accede a su directorio.

Ejecuta `npm install` para instalar las dependencias necesarias[28].

## Configuración de entornos

Para los builds de producción es necesario definir las siguientes variables de entorno antes de compilar:

- `SUPABASE_URL`: URL de tu proyecto Supabase.
- `SUPABASE_KEY`: clave pública (anon) del proyecto.

El script `scripts/generate-env.mjs` se ejecuta automáticamente antes de la compilación (`npm run build`) y genera `src/environments/environment.prod.ts` con estos valores[29].

## Desarrollo

Para levantar un servidor de desarrollo con recarga automática ejecuta:

```bash
npm start
```

A continuación abre `http://localhost:4200` en tu navegador favorito[30].

## Compilación y despliegue

Ejecuta `npm run build` para generar la versión optimizada de la aplicación en `dist/`[25].

Puedes desplegar el contenido de `dist/victorai-blog` en cualquier hosting estático. Si usas Vercel, el archivo `vercel.json` ya configura el comportamiento de SPA para que todas las rutas apunten a `index.html`[1].

## Pruebas

Lanza las pruebas unitarias ejecutando:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Esto ejecutará las pruebas definidas en el proyecto usando Karma y Jasmine[24].

## Estructura del proyecto

```
src/
  app/
    pages/           Componentes de páginas (home, artículos, categorías, python…)
    shared/          Pipes y utilidades (markdown, stripMarkdown)
    services/        Servicios (Supabase, ejercicios de Python)
  assets/            Recursos estáticos (imágenes, ejercicios de Python)
  environments/      Configuración por entorno
```

Esta estructura sigue las buenas prácticas de Angular y aprovecha los componentes standalone, lo que facilita la modularidad y la carga perezosa.

## Tecnologías utilizadas

- Angular 19: framework frontend empleado para la construcción de la SPA[31].
- Supabase: base de datos como servicio y API REST para almacenar posts, categorías y suscriptores[5].
- Bootstrap 5: biblioteca de estilos importada desde `node_modules`[3].
- Highlight.js y `ngx-highlightjs`: resaltado de código, especialmente en la sección de ejercicios de Python[32].
- Marked y DOMPurify: conversión y saneamiento de Markdown[21].
- RxJS: manejo de flujos asíncronos y combinaciones de peticiones, como la lectura paralela de archivos Python[20].

## Contribución

Se agradecen contribuciones de todo tipo: corrección de errores, mejoras en la estructura, nuevos artículos o ejercicios de Python. Si deseas añadir nuevas entradas a la base de datos, puedes emplear el método `addPost()` de `SupabaseService`, que permite crear un post con título, contenido, slug de categoría y URL de portada[8]. Para incluir nuevos ejercicios de Python, edita el archivo `src/assets/python-exercises/exercises.json` y añade las rutas correspondientes en `assets/python-exercises`.

Por favor, abre un pull request con una descripción detallada de los cambios y su motivación.

## Licencia

Actualmente este proyecto no especifica una licencia[33]. Esto implica que todos los derechos están reservados. Si deseas reutilizar o distribuir el código, considera incluir una licencia (por ejemplo MIT, GPL, etc.) que determine los permisos y restricciones.

[1] vercel.json

https://github.com/VictorAmadeu/victorai-blog/blob/main/vercel.json

[2] app.routes.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/app.routes.ts

[3] angular.json

https://github.com/VictorAmadeu/victorai-blog/blob/1d3f8a42dc14e342ee23bd6234b556548b39e118/angular.json

[4] [6] [11] home.component.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/pages/home/home.component.ts

[5] [7] [8] [9] [10] supabase.service.ts

https://github.com/VictorAmadeu/victorai-blog/blob/1d3f8a42dc14e342ee23bd6234b556548b39e118/src/app/supabase.service.ts

[12] articles.component.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/pages/articles/articles.component.ts

[13] categories.component.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/pages/categories/categories.component.ts

[14] [15] category-posts.component.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/pages/category-posts/category-posts.component.ts

[16] exercises.json

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/assets/python-exercises/exercises.json

[17] [18] python-exercises.service.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/services/python-exercises.service.ts

[19] python.component.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/pages/python/python.component.ts

[20] [32] python-detail.component.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/pages/python-detail/python-detail.component.ts

[21] [22] markdown.pipe.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/shared/pipes/markdown.pipe.ts

[23] strip-markdown.pipe.ts

https://github.com/VictorAmadeu/victorai-blog/blob/main/src/app/shared/pipes/strip-markdown.pipe.ts

[24] [25] [26] [27] [28] [29] [30] [31] [33] README.md

https://github.com/VictorAmadeu/victorai-blog/blob/main/README.md

