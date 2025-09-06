// src/app/shared/filter-posts.pipe.ts
// Pipe standalone para búsqueda por texto y filtrado por categoría.
// ⚠️ Importante: preserva el tipo de entrada (si entra Post[], sale Post[])
// para que el template siga “viendo” id, created_at, etc.

import { Pipe, PipeTransform } from '@angular/core';

// 1) Mínimo requerido para aplicar los filtros sin atarnos a un modelo concreto.
type MinimalForFilter = {
  title?: string | null;
  content?: string | null;
  category?: string | null; // por si usas "category"
  category_slug?: string | null; // o "category_slug" (caso Supabase)
};

@Pipe({
  name: 'filterPosts',
  standalone: true, // 2) Pipe standalone para importarlo en componentes standalone
})
export class FilterPostsPipe implements PipeTransform {
  // 3) <T extends MinimalForFilter> → preserva el T de entrada (p.ej., Post)
  transform<T extends MinimalForFilter>(
    posts: T[] | null | undefined,
    term: string = '',
    category: string = ''
  ): T[] {
    if (!Array.isArray(posts) || posts.length === 0) return [];

    const t = term.trim().toLowerCase();
    const c = category.trim().toLowerCase();

    return posts.filter((p) => {
      const title = (p.title ?? '').toLowerCase();
      const content = (p.content ?? '').toLowerCase();
      const cat = (p.category_slug ?? p.category ?? '').toLowerCase();

      const matchesTerm =
        !t || title.includes(t) || content.includes(t) || cat.includes(t);
      const matchesCat = !c || cat === c;

      return matchesTerm && matchesCat;
    });
  }
}
