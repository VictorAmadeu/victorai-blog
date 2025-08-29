// src/app/pages/category-posts/category-posts.component.ts
// Vista de categoría (PRO): lee :slug, trae el NOMBRE REAL desde Supabase
// y muestra los posts de esa categoría renderizando el contenido en Markdown.

import { Component, OnInit, OnDestroy, inject } from '@angular/core'; // Decorador + ciclo de vida
import { CommonModule, DatePipe } from '@angular/common'; // *ngIf, *ngFor, date pipe
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router'; // Leer :slug + enlaces
import { SupabaseService, Post } from '../../supabase.service'; // Servicio + tipos
import { Subscription } from 'rxjs'; // Para desuscribir paramMap

// Pipe que convierte Markdown → HTML seguro (marked + DOMPurify)
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-category-posts', // (opcional) selector del componente
  standalone: true, // Standalone: sin NgModule
  imports: [CommonModule, RouterLink, DatePipe, MarkdownPipe], // Módulos/Pipes usados en la plantilla
  templateUrl: './category-posts.component.html', // Vista asociada
  styleUrls: ['./category-posts.component.scss'], // Estilos locales del componente
})
export class CategoryPostsComponent implements OnInit, OnDestroy {
  // ---- Inyección de dependencias (API moderna) --------------------------------
  private readonly route = inject(ActivatedRoute); // Para leer :slug de la URL
  private readonly supa = inject(SupabaseService); // Servicio para hablar con Supabase

  // ---- Estado público para la vista -------------------------------------------
  posts: Post[] = []; // Artículos de la categoría
  loading = false; // Indicador de carga
  error: string | null = null; // Texto de error si algo falla

  slug = ''; // Slug crudo de la URL (ej. "ingenieria-de-ia")
  prettyCategoryName = ''; // Nombre que se muestra en el <h1>

  // Guardamos la suscripción a los parámetros de ruta para poder desuscribir
  private paramsSub?: Subscription;

  // ---- Ciclo de vida -----------------------------------------------------------
  ngOnInit(): void {
    // Nos suscribimos a los cambios de :slug (Angular puede reutilizar el componente)
    this.paramsSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.slug = params.get('slug') || '';
      // Cargamos NOMBRE + POSTS a la vez (ver método más abajo)
      this.loadCategoryAndPosts(this.slug);
    });
  }

  ngOnDestroy(): void {
    // Buenas prácticas: evitar fugas de memoria
    this.paramsSub?.unsubscribe();
  }

  // ---- Lógica principal: leer nombre de categoría + posts en paralelo ----------
  private async loadCategoryAndPosts(slug: string): Promise<void> {
    // Reset de estados
    this.loading = true;
    this.error = null;
    this.posts = [];
    this.prettyCategoryName = '';

    // Validación rápida
    if (!slug) {
      this.error = 'Categoría no especificada.';
      this.loading = false;
      return;
    }

    // Disparamos ambas consultas EN PARALELO para ir más rápido
    const [catRes, postsRes] = await Promise.all([
      this.supa.getCategoryBySlug(slug), // ← nombre “oficial” desde BD
      this.supa.getPostsByCategory(slug), // ← artículos de la categoría
    ]);

    // 1) Gestionar errores (cualquiera de las dos llamadas)
    if (catRes.error) {
      // No frenamos la página por esto; intentamos “arreglar” con el slug.
      console.warn('No se pudo leer la categoría:', catRes.error);
    }
    if (postsRes.error) {
      // Si fallan los posts sí mostramos error (es lo principal de la vista)
      this.error = postsRes.error.message || 'Error al cargar artículos.';
      this.loading = false;
      return;
    }

    // 2) Determinar el nombre que se mostrará:
    //    Preferimos name desde la BD; si no, generamos uno “bonito” a partir del slug.
    const dbName = catRes.data?.name?.trim();
    this.prettyCategoryName = dbName || this.slugToTitle(slug);

    // 3) Cargar artículos (si no hubo error en posts)
    this.posts = postsRes.data ?? [];

    // 4) Fin de carga
    this.loading = false;
  }

  // ---- Utilidad: convertir slug → Título amigable ------------------------------
  //   - Capitaliza palabras significativas
  //   - Mantiene en minúscula conectores (de, del, la…)
  //   - Convierte acrónimos típicos a mayúsculas (IA, ML, NLP…)
  //   - Añade fix de acentos comunes (ingenieria → Ingeniería)
  private slugToTitle(slug: string): string {
    const small = new Set([
      'de',
      'del',
      'la',
      'las',
      'los',
      'y',
      'en',
      'para',
      'con',
    ]);
    const accentFix: Record<string, string> = { ingenieria: 'Ingeniería' };
    const acronyms = new Set(['ia', 'ml', 'nlp', 'cv', 'dl']);

    const parts = slug.split('-');

    return parts
      .map((raw, idx) => {
        const w = raw.toLowerCase();

        if (acronyms.has(w)) return w.toUpperCase(); // IA, ML…
        if (accentFix[w]) return accentFix[w]; // Ingeniería…

        if (small.has(w))
          return idx === 0 // “de”, “del”…
            ? w.charAt(0).toUpperCase() + w.slice(1) // Primera palabra capitalizada
            : w; // Resto en minúsculas

        return w.charAt(0).toUpperCase() + w.slice(1); // Capitalización normal
      })
      .join(' ');
  }

  // ---- trackBy para *ngFor (rendimiento) --------------------------------------
  trackByPostId(_i: number, p: Post): string {
    return p.id;
  }
}
