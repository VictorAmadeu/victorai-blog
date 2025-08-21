// src/app/pages/articles/articles.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss',
})
export class ArticlesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  loading = false;
  posts: any[] = [];
  errorMsg = '';

  async ngOnInit() {
    this.loading = true;
    const { data, error } = await this.supabase.getPosts();
    if (error) this.errorMsg = error.message;
    this.posts = data ?? [];
    this.loading = false;
  }
}
