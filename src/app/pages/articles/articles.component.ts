// src/app/pages/articles/articles.component.ts
// Lista artículos desde Supabase y muestra extractos LIMPIOS.
// Nota: en esta vista NO usamos el pipe 'markdown', sólo 'stripMarkdown' para el resumen.

import { Component, OnInit, inject } from '@angular/core'; // Decorador + ciclo de vida
import { CommonModule, DatePipe } from '@angular/common'; // *ngIf, *ngFor y date pipe
import { RouterLink } from '@angular/router'; // [routerLink]
import { SupabaseService, Post } from '../../supabase.service'; // Servicio + tipo Post

// Pipes de presentación:
// - StripMarkdownPipe: quita sintaxis MD para previews.
import { StripMarkdownPipe } from '../../shared/pipes/strip-markdown.pipe';

@Component({
  selector: 'app-articles',
  standalone: true,
  // 👇 Importamos sólo lo que REALMENTE usa la plantilla de este componente.
  imports: [CommonModule, RouterLink, DatePipe, StripMarkdownPipe],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss'],
})
export class ArticlesComponent implements OnInit {
  // Servicio de datos
  private readonly supa = inject(SupabaseService);

  // Estado
  posts: Post[] = [];
  loading = true;
  errorMsg: string | null = null;

  // Carga inicial
  async ngOnInit() {
    const { data, error } = await this.supa.getPosts(50);
    if (error) {
      this.errorMsg = error.message || 'Error al cargar artículos';
      this.posts = [];
      this.loading = false;
      return;
    }
    this.posts = data ?? [];
    this.loading = false;
  }

  // Formatea el slug para el badge de categoría (evitamos regex en la plantilla)
  slugToLabel(slug?: string): string {
    return (slug ?? '').split('-').join(' ');
  }

  // trackBy para *ngFor (rendimiento)
  trackById(_i: number, p: Post): string {
    return p.id;
  }
}
