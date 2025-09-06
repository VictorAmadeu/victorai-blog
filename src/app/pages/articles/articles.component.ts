// src/app/pages/articles/articles.component.ts
// Lista artículos desde Supabase y añade búsqueda + filtrado en el FRONT.
// - Usa ngModel para el término de búsqueda y el chip activo (FormsModule).
// - Aplica FilterPostsPipe (standalone) para filtrar por texto y categoría.

import { Component, OnInit, inject } from '@angular/core'; // 1) Decorador + ciclo de vida
import { CommonModule, DatePipe } from '@angular/common'; // 2) *ngIf, *ngFor y |date
import { RouterLink } from '@angular/router'; // 3) [routerLink]
import { FormsModule } from '@angular/forms'; // 4) [(ngModel)]

import { SupabaseService, Post } from '../../supabase.service'; // 5) Servicio + tipo Post

// 6) Pipes de presentación (standalone):
import { StripMarkdownPipe } from '../../shared/pipes/strip-markdown.pipe'; // 6.1) Limpia Markdown
import { FilterPostsPipe } from '../../shared/filter-posts.pipe'; // 6.2) ← RUTA CORREGIDA

// 7) UI Kit (standalone):
import { UiCardComponent } from '../../ui/ui-card/ui-card.component'; // 7.1) <ui-card>
import { UiChipComponent } from '../../ui/ui-chip/ui-chip.component'; // 7.2) <ui-chip>

@Component({
  selector: 'app-articles', // 8) Selector del componente
  standalone: true, // 9) Standalone: sin NgModule
  // 10) Importamos SOLO lo que el template usa realmente
  imports: [
    CommonModule, // *ngIf, *ngFor
    RouterLink, // [routerLink]
    FormsModule, // [(ngModel)]
    DatePipe, // | date
    StripMarkdownPipe, // | stripMarkdown
    FilterPostsPipe, // | filterPosts:term:cat
    UiCardComponent, // <ui-card>
    UiChipComponent, // <ui-chip>
  ],
  templateUrl: './articles.component.html', // 11) Ruta a la plantilla
  styleUrls: ['./articles.component.scss'], // 12) Estilos específicos
})
export class ArticlesComponent implements OnInit {
  // 13) Inyección del servicio de datos
  private readonly supa = inject(SupabaseService);

  // 14) Estado remoto
  posts: Post[] = []; // Lista de artículos
  loading = true; // Skeletons on/off
  errorMsg: string | null = null; // Mensajes de error

  // 15) Estado de búsqueda/filtrado (front-only)
  searchTerm = ''; // Término de búsqueda
  activeCategory = ''; // '', 'tech', 'ai', etc.

  // 16) Carga inicial
  async ngOnInit() {
    const { data, error } = await this.supa.getPosts(50); // Hasta 50 artículos
    if (error) {
      // Manejo de error
      this.errorMsg = error.message || 'Error al cargar artículos';
      this.posts = [];
      this.loading = false;
      return;
    }
    this.posts = data ?? []; // Asigna datos
    this.loading = false; // Fin loading
  }

  // ...
  // 17) Utilidades de presentación
  slugToLabel(slug?: string): string {
    return (slug ?? '').split('-').join(' ');
  }

  // 18) trackBy para *ngFor (acepta cualquier item con id:string)
  trackById(_i: number, p: { id: string }): string {
    return p.id;
  }
  // ...
}
// FIN src/app/pages/articles/articles.component.ts