// src/app/pages/articles/articles.component.ts
// Componente standalone para listar artículos con badge de categoría enlazado.

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // *ngIf, *ngFor, date pipe
import { RouterLink } from '@angular/router'; // [routerLink] en la plantilla
import { SupabaseService, Post } from '../../supabase.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterLink], // 👈 IMPORTANTE para usar [routerLink]
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss',
})
export class ArticlesComponent implements OnInit {
  private supa = inject(SupabaseService);

  posts: Post[] = [];
  loading = false;
  errorMsg: string | null = null;

  async ngOnInit() {
    this.loading = true;
    const { data, error } = await this.supa.getPosts(50);
    if (error) this.errorMsg = error.message || 'Error al cargar artículos';
    this.posts = data ?? [];
    this.loading = false;
  }

  // Helper para mostrar el slug "bonito" en la plantilla (evita regex en HTML):
  // "ingenieria-de-ia" -> "ingenieria de ia"
  slugToLabel(slug?: string): string {
    return (slug ?? '').split('-').join(' ');
  }

  // Sugerencia de rendimiento para *ngFor
  trackById(_i: number, p: Post) {
    return p.id;
  }
}
