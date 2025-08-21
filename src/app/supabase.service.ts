// src/app/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

type ApiError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};
type ApiResult<T> = { data: T | null; error: ApiError | null; status?: number };

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;

  private readonly TABLE = 'newsletter_subscribers';
  private readonly REST_BASE = `${environment.supabaseUrl}/rest/v1`;

  constructor() {
    // Cliente ligero, sin sesión persistente ni auto-refresh (evita locks)
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            apikey: environment.supabaseKey,
            Authorization: `Bearer ${environment.supabaseKey}`,
          },
        },
      }
    );
  }

  // ---------- NEWSLETTER ----------
  // Insert SENCILLO por REST (sin upsert, sin "resolution=merge-duplicates")
  async addSubscriber(email: string): Promise<ApiResult<any>> {
    try {
      const res = await fetch(
        `${this.REST_BASE}/${encodeURIComponent(this.TABLE)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            apikey: environment.supabaseKey,
            Authorization: `Bearer ${environment.supabaseKey}`,
            'Content-Profile': 'public',
            Prefer: 'return=representation', // nos devuelve la fila insertada
          },
          body: JSON.stringify({ email }),
        }
      );

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return {
          data: null,
          error: json || { message: res.statusText },
          status: res.status,
        };
      }
      const row = Array.isArray(json) ? json[0] : json;
      return { data: row, error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }

  // (opcional) consulta rápida para verificar filas
  async listSubscribers(limit = 5): Promise<ApiResult<any[]>> {
    try {
      const url =
        `${this.REST_BASE}/${encodeURIComponent(this.TABLE)}` +
        `?select=id,email,created_at&order=created_at.desc.nullslast&limit=${limit}`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          apikey: environment.supabaseKey,
          Authorization: `Bearer ${environment.supabaseKey}`,
          'Accept-Profile': 'public',
        },
      });
      const json = await res.json();
      if (!res.ok) return { data: null, error: json, status: res.status };
      return { data: json, error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }

  // ---------- BLOG POSTS ----------
  async getPosts(limit = 10): Promise<ApiResult<any[]>> {
    try {
      const url =
        `${this.REST_BASE}/posts` +
        `?select=id,title,content,created_at&order=created_at.desc.nullslast&limit=${limit}`;

      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          apikey: environment.supabaseKey,
          Authorization: `Bearer ${environment.supabaseKey}`,
          'Accept-Profile': 'public',
        },
      });

      const json = await res.json();
      if (!res.ok) return { data: null, error: json, status: res.status };
      return { data: json, error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }
}
