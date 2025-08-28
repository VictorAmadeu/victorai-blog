# Victorai Blog

Proyecto de blog personal construido con [Angular](https://angular.io/) 19, estilizado con [Bootstrap](https://getbootstrap.com/) y con datos almacenados en [Supabase](https://supabase.com/). También incorpora resaltado de código mediante [highlight.js](https://highlightjs.org/).

## Requisitos previos
- [Node.js](https://nodejs.org/) 18 o superior
- [npm](https://www.npmjs.com/) 9 o superior
- (Opcional) Angular CLI instalada globalmente: `npm install -g @angular/cli`

## Instalación
```bash
npm install
```

## Desarrollo local
Inicia un servidor de desarrollo que recarga la página automáticamente al detectar cambios:
```bash
npm start
```
Luego abre [http://localhost:4200](http://localhost:4200) en tu navegador.

## Variables de entorno
Para los builds de producción es necesario definir las siguientes variables de entorno antes de ejecutar `npm run build`:

- `SUPABASE_URL`: URL de tu proyecto Supabase.
- `SUPABASE_KEY`: clave pública (anon) del proyecto.

Durante el proceso de compilación se ejecuta `scripts/generate-env.mjs`, que genera `src/environments/environment.prod.ts` con estos valores.

## Compilación
Genera los artefactos listos para producción en `dist/`:
```bash
npm run build
```

## Pruebas
Ejecuta las pruebas unitarias con [Karma](https://karma-runner.github.io) y [Jasmine](https://jasmine.github.io/):
```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

## Despliegue
El proyecto incluye un archivo `vercel.json` que configura el comportamiento de una SPA en [Vercel](https://vercel.com/). Tras compilar, puedes desplegar el contenido del directorio `dist/victorai-blog` en el servicio de tu preferencia.

## Estructura del proyecto
```
src/
  app/            Componentes y lógica principal
  assets/         Recursos estáticos
  environments/   Configuración de entornos
```

## Tecnologías utilizadas
- Angular 19 con componentes standalone
- Supabase para el backend y almacenamiento de datos
- Bootstrap 5 para estilos
- highlight.js para resaltado de código

## Licencia
Actualmente este proyecto no especifica una licencia.