# VictorAI Blog

VictorAI Blog es un proyecto de blog personal desarrollado como ejercicio de aprendizaje de inteligencia artificial y desarrollo web. La aplicación está construida con Angular 19 en modo standalone, se estiliza con Bootstrap 5 y utiliza Supabase como backend para almacenar artículos, categorías, mensajes de contacto y suscriptores a la newsletter. El diseño se adapta a dispositivos móviles y puede desplegarse como una Single Page Application (SPA) en Vercel u otro servicio de hosting estático.

## Características principales

### Arquitectura Angular moderna

- **Componentes standalone:** la aplicación se organiza mediante componentes standalone, sin necesidad de NgModules. Las rutas se definen en `src/app/app.routes.ts` y admiten carga lazy para categorías y páginas de detalle.
- **Transiciones y accesibilidad:** el componente raíz (`app.component`) implementa animaciones entre rutas, un enlace de “saltar al contenido”, un botón flotante “volver arriba” y navegación accesible con teclado.
- **UI reutilizable:** se incluyen componentes reutilizables como `ui-card`, `ui-chip`, `ui-skeleton` y `ui-scroll-top` para tarjetas, chips de categorías, esqueletos de carga y el botón “ir al inicio”.

### Gestión de datos con Supabase

- **Servicio unificado:** `src/app/supabase.service.ts` encapsula toda la comunicación con Supabase. Utiliza la API REST (PostgREST) para consultas y el SDK oficial `@supabase/supabase-js` para insertar mensajes sin leer la fila creada.

#### Tablas utilizadas:

- **posts:** artículos del blog con título, contenido en Markdown, slug de categoría, portada y fecha de creación.
- **categories:** categorías con `name` y `slug`.
- **contact_messages:** mensajes enviados desde el formulario de contacto.
- **newsletter_subscribers:** suscriptores a la newsletter (solo se almacena el correo).

#### Operaciones implementadas:

- Obtener los últimos artículos y listar hasta N entradas.
- Crear un artículo nuevo desde el front (`addPost()`), incluyendo portada y slug de categoría.
- Listar categorías en orden alfabético y obtener una categoría por slug.
- Listar artículos pertenecientes a una categoría.
- Añadir suscriptores a la newsletter y listar suscriptores.
- Enviar mensajes de contacto sin recibir datos de vuelta (`sendContactMessage()`).

### Sección de artículos

#### Home

La portada muestra las últimas entradas (dos por defecto), con tarjetas que incluyen el título, fecha y un extracto del contenido. Se utiliza una imagen de portada si está presente; de lo contrario, se muestra un placeholder local.

#### Listado de artículos

La ruta `/articulos` carga hasta 50 posts y permite buscar por texto y filtrar por categoría en el front. El pipe `filterPosts` preserva el tipo de entrada y aplica búsquedas sobre título, contenido o slug de categoría.

#### Extractos limpios

El pipe `stripMarkdown` elimina la sintaxis de Markdown para generar extractos legibles en las tarjetas.

### Categorías

#### Carga perezosa

Las rutas `/categorias` y `/categorias/:slug` se importan sólo cuando el usuario las visita.

#### Listado

`CategoriesComponent` muestra todas las categorías disponibles.

#### Detalle de categoría

`CategoryPostsComponent` lee el slug de la URL, consulta en paralelo el nombre de la categoría y sus artículos, convierte el slug en un título legible (capitaliza, corrige acentos y acrónimos) y renderiza el contenido de cada post mediante el pipe `markdown`.

### Página “Sobre mí”

La ruta `/sobre-mi` muestra una página estática con información personal sobre el autor, su experiencia, proyectos destacados, formación, tecnologías dominadas e idiomas. El contenido se define en `src/app/pages/about/about.component.html` y utiliza la misma tipografía y estilos globales que el resto del sitio.

### Sección de Python

El directorio `src/assets/python-exercises` contiene un catálogo JSON (`exercises.json`) con ejercicios de Python. Cada entrada incluye un `id`, `titulo`, `descripcion`, y una lista de archivos `.py` con su ruta y salida esperada.

#### La sección Python ofrece:

- **Listado de ejercicios (`/python`):** `PythonComponent` lee el catálogo mediante `PythonExercisesService.listar()` y muestra tarjetas con título y descripción.
- **Detalle de ejercicio (`/python/:id`):** `PythonDetailComponent` obtiene un ejercicio por ID, lee sus archivos `.py` en paralelo mediante `leerArchivoText()`, resalta el código con `ngx-highlightjs` y muestra la salida esperada debajo de cada fragmento.

### Markdown seguro y resaltado de código

- El pipe `markdown` convierte contenido en Markdown a HTML usando `marked` y lo sanea con `DOMPurify` para prevenir XSS antes de inyectarlo en la vista.
- El resaltado de código se realiza con Highlight.js y el módulo `ngx-highlightjs`, utilizando el tema GitHub.

### Formulario para Enviar Feedback

- **Contacto:** la página principal incluye un formulario de contacto que solicita nombre, correo, asunto y mensaje. El envío se realiza a la tabla `contact_messages` mediante `sendContactMessage()`. Tras el envío se limpian los campos y se muestra un mensaje de éxito; en caso de error se informa al usuario.

### Experiencia de usuario

- **Navbar accesible:** la barra de navegación es responsiva, se adapta a móviles con menú hamburguesa y se cierra automáticamente tras tres segundos o al pulsar una opción. Incluye enlaces a Inicio, Artículos, Categorías, Sobre mí y un enlace que desplaza suavemente al formulario de contacto.
- **Animaciones:** se definen transiciones suaves entre páginas usando Angular Animations.
- **Botón “Volver arriba”:** el componente `UiScrollTopComponent` muestra un botón flotante que aparece al hacer scroll y desplaza la página al inicio con un efecto suave.
- **Skeleton loaders:** durante la carga de datos se muestran esqueletos animados para mejorar la percepción de rendimiento.
- **Diseño y estilos:** los estilos globales (`styles.scss`) definen variables CSS para colores, tamaños, espaciados y sombras. Se importa la fuente “Poppins” desde Google Fonts y el tema de Highlight.js. Además se incluyen estilos para elementos Markdown, botones, enlaces accesibles y se respeta la preferencia de reducción de movimiento.

### Pruebas y calidad

El proyecto está configurado para ejecutar pruebas unitarias con Karma y Jasmine. Puedes lanzarlas con:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

### Despliegue como SPA

El archivo `vercel.json` configura Vercel para servir la aplicación como SPA, redirigiendo todas las rutas que no correspondan a un archivo físico a `index.html`. Después de compilar (`npm run build`), los artefactos de producción se encuentran en `dist/victorai-blog` y pueden desplegarse en cualquier hosting estático.

### Requisitos previos

- Node.js 18 o superior y npm 9 o superior.
- (Opcional) CLI de Angular instalada globalmente: `npm install -g @angular/cli`.

### Instalación

- Clona este repositorio y accede a su directorio.
- Ejecuta `npm install` para instalar las dependencias.
- Copia el archivo `.env.example` (si existe) o define las variables `SUPABASE_URL` y `SUPABASE_KEY` en tu entorno de shell. Estos valores se utilizarán para generar el fichero `src/environments/environment.prod.ts` en el paso de build.
- Para iniciar el servidor de desarrollo con recarga automática, ejecuta:

```bash
npm start
```

- Abre <http://localhost:4200> en tu navegador.

### Configuración de entornos

Para los builds de producción es necesario definir estas variables de entorno:

- **SUPABASE_URL:** URL de tu proyecto Supabase.
- **SUPABASE_KEY:** clave pública (“anon”) de tu proyecto.

Antes de compilar (`npm run build`), se ejecuta el script `scripts/generate-env.mjs` que crea `src/environments/environment.prod.ts` con estas variables. No se deben commitear claves secretas; para desarrollo local se utiliza `src/environments/environment.ts` con un proyecto Supabase de ejemplo y se recomienda reemplazarlo por tus propios datos.

### Compilación y despliegue

- Ejecuta `npm run build` para generar la versión optimizada de la aplicación en `dist/victorai-blog`.
- Sube el contenido de `dist/victorai-blog` a tu proveedor de hosting estático preferido. Para Vercel, el archivo `vercel.json` ya indica que todas las rutas se redirijan a `index.html`.

### Estructura del proyecto

```
src/
  app/
    pages/           Componentes de páginas (home, artículos, categorías, python, sobre-mi)
    shared/          Pipes (markdown, stripMarkdown, filterPosts) y utilidades
    services/        Servicios (SupabaseService, PythonExercisesService)
    ui/              Componentes de interfaz reutilizables (card, chip, skeleton, scroll-top)
  assets/            Recursos estáticos (imágenes, ejercicios de Python)
  environments/      Configuración de entornos (desarrollo)
scripts/             Scripts de soporte (generate-env.mjs)
```

### Tecnologías utilizadas

- **Angular 19:** framework frontend para construir la SPA.
- **Supabase:** base de datos como servicio con API REST y SDK de JavaScript.
- **Bootstrap 5 y Bootstrap Icons:** estilización y componentes responsivos.
- **Highlight.js y ngx-highlightjs:** resaltado de código para los ejercicios de Python.
- **Marked y DOMPurify:** transformación y saneamiento de Markdown.
- **RxJS:** manejo de flujos asíncronos y combinaciones de peticiones.
- **SCSS:** estilos globales con variables, temas y componentes personalizados.

### Contribución

Se agradecen contribuciones de todo tipo: corrección de errores, mejoras en la estructura, nuevos artículos o ejercicios de Python. Para añadir nuevas entradas a la base de datos, puedes utilizar `SupabaseService.addPost()`, que permite crear un artículo con título, contenido, slug de categoría y URL de portada. Para incluir ejercicios de Python, edita `src/assets/python-exercises/exercises.json` y añade las rutas correspondientes en el directorio `assets/python-exercises`. Asegúrate de incluir pruebas cuando apliquen y de seguir las guías de codificación de Angular.

Si deseas colaborar, abre un pull request explicando claramente los cambios propuestos.

### Licencia

Este proyecto actualmente no especifica una licencia. Todos los derechos están reservados. Si deseas reutilizar o distribuir el código, considera añadir una licencia (por ejemplo MIT, GPL, etc.) que determine los permisos y restricciones.



