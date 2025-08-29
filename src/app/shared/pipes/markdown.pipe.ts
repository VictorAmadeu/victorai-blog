// src/app/shared/pipes/markdown.pipe.ts

// 1) Pipe de Angular y tipo para devolver HTML seguro a [innerHTML]
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// 2) Motor Markdown
import { marked } from 'marked';

// 3) Saneador para evitar XSS
import DOMPurify from 'dompurify';

/* ---------------------------------------------------------------------------
   CONFIGURACIÓN DE MARKED
   - Forzamos modo SÍNCRONO (async:false) para que 'marked.parse' devuelva string
     (evita el error de tipos con Promise<string>).
   - GFM y breaks para un Markdown estilo GitHub.
   ⚠️ NOTA: En tu versión de 'marked' ya no existen 'mangle' ni 'headerIds' en las opciones.
--------------------------------------------------------------------------- */
marked.setOptions({
  async: false, // <- clave para no recibir Promise<string>
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // saltos de línea como <br>
});

/**
 * Pipe 'markdown'
 * Convierte Markdown a HTML y lo sanea con DOMPurify.
 * Devuelve SafeHtml para usar en [innerHTML] sin riesgos.
 */
@Pipe({
  name: 'markdown',
  standalone: true,
  pure: true, // pipe puro: recalcula solo si cambia la referencia de entrada
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(md?: string): SafeHtml {
    // 1) Aseguramos una cadena
    const source = md ?? '';

    // 2) Markdown -> HTML (string garantizado al tener async:false)
    const rawHtml = marked.parse(source) as string;

    // 3) Saneamos el HTML generado
    const cleanHtml = DOMPurify.sanitize(rawHtml);

    // 4) Indicamos a Angular que es seguro para [innerHTML]
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}
