// src/app/pages/category-posts/category-posts.component.ts

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { SupabaseService, Post } from '../../supabase.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-posts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-posts.component.html',
  // 👇 IMPORTANTE: en Angular ≤16 usa 'styleUrls' (plural).
  // Si tu proyecto es 17, también funciona 'styleUrls'.
  styleUrls: ['./category-posts.component.scss'],
})
export class CategoryPostsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly supa = inject(SupabaseService);

  posts: Post[] = [];
  loading = false;
  error: string | null = null;

  slug = '';
  prettyCategoryName = '';

  private paramsSub?: Subscription;

  ngOnInit(): void {
    this.paramsSub = this.route.paramMap.subscribe((params: ParamMap) => {
      this.slug = params.get('slug') || '';
      this.prettyCategoryName = this.slug
        ? this.slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
        : 'Categoría';
      this.loadPostsByCategory(this.slug);
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  private async loadPostsByCategory(slug: string): Promise<void> {
    this.loading = true;
    this.error = null;
    this.posts = [];

    if (!slug) {
      this.error = 'Categoría no especificada.';
      this.loading = false;
      return;
    }

    const { data, error } = await this.supa.getPostsByCategory(slug);

    if (error) {
      this.error =
        error.message || 'Error al cargar los artículos de esta categoría.';
      this.loading = false;
      return;
    }

    this.posts = data ?? [];
    this.loading = false;
  }

  trackByPostId(_i: number, p: Post): string {
    return p.id;
  }
}
