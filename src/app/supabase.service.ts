// src/app/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Auth (GitHub) – opcional para más adelante
  signInWithGithub() {
    return this.client.auth.signInWithOAuth({ provider: 'github' });
  }
  signOut() {
    return this.client.auth.signOut();
  }

  // CRUD básico de posts
  getPosts() {
    // Si añadiste 'created_at' en la tabla, puedes ordenar por ahí.
    return this.client.from('posts').select('*');
  }
  addPost(post: { title: string; content: string; user_id?: string }) {
    return this.client.from('posts').insert(post).select().single();
  }
}
