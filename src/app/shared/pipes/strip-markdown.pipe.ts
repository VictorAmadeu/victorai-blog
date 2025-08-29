import { Pipe, PipeTransform } from '@angular/core';

/**
 * Elimina sintaxis básica de Markdown y devuelve texto plano.
 * Útil para previews/extractos en tarjetas.
 */
@Pipe({ name: 'stripMarkdown', standalone: true })
export class StripMarkdownPipe implements PipeTransform {
  transform(md?: string): string {
    if (!md) return '';
    return md
      .replace(/```[\s\S]*?```/g, '') // bloques de código
      .replace(/`[^`]*`/g, '') // inline code
      .replace(/!\[[^\]]*]\([^)]*\)/g, '') // imágenes ![alt](url)
      .replace(/\[([^\]]+)]\([^)]*\)/g, '$1') // enlaces [txt](url)
      .replace(/[#>*_~\-]+/g, ' ') // símbolos md
      .replace(/\s{2,}/g, ' ') // espacios extra
      .trim();
  }
}
