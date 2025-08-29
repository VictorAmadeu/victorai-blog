// src/app/supabase.service.ts

// 1) Angular inyectable para que el servicio esté disponible en toda la app.
import { Injectable } from '@angular/core';

// 2) SDK oficial de Supabase: lo usamos para inicializar el cliente.
//    Nota: en este servicio consumimos la API REST de PostgREST con fetch
//    (por simplicidad y control de cabeceras), pero mantener el cliente
//    creado es útil si más adelante quieres auth en el front.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 3) Variables de entorno: supabaseUrl y supabaseKey (anon) definidas por ti.
import { environment } from '../environments/environment';

// 4) Tipado de errores “amigable” para respuestas REST.
type ApiError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

// 5) Envoltorio genérico de respuestas: data, error y status HTTP.
type ApiResult<T> = { data: T | null; error: ApiError | null; status?: number };

// 6) Tipos de dominio mínimos que usaremos en la app.
export type Category = {
  id: string; // uuid
  name: string; // nombre visible, p.ej. "Ingeniería de IA"
  slug: string; // slug url-safe, p.ej. "ingenieria-de-ia"
  created_at?: string; // timestamp (opcional)
};

export type Post = {
  id: string; // uuid
  title: string; // título del artículo
  content: string; // cuerpo (HTML/Markdown renderizable)
  category_slug?: string; // relación simple con categories.slug
  user_id?: string | null; // autor (si usas auth y RLS por usuario)
  created_at?: string; // timestamp
  // Si más adelante añades excerpt, cover_url, etc., amplías este tipo.
};

// 7) Decorador Injectable: el servicio se registra en el inyector raíz.
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // 8) Cliente de Supabase (aunque operamos con REST, lo conservamos).
  private client: SupabaseClient;

  // 9) Constantes de tablas y base REST (PostgREST) para construir URLs.
  private readonly NEWSLETTER_TABLE = 'newsletter_subscribers';
  private readonly POSTS_TABLE = 'posts';
  private readonly CATEGORIES_TABLE = 'categories';
  private readonly REST_BASE = `${environment.supabaseUrl}/rest/v1`;

  constructor() {
    // 10) Inicializamos el cliente con opciones "ligeras"
    //     - sin persistir sesión
    //     - sin auto refresh
    //     - con cabeceras globales (apikey y Bearer) para REST.
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

  // ---------------------------------------------------------------------------
  // Utilidades internas (cabeceras REST)
  // ---------------------------------------------------------------------------

  // 11) Cabeceras estándar para lecturas (GET) en esquema "public".
  private get readHeaders() {
    return {
      Accept: 'application/json',
      apikey: environment.supabaseKey,
      Authorization: `Bearer ${environment.supabaseKey}`,
      'Accept-Profile': 'public',
    } as const;
  }

  // 12) Cabeceras estándar para escrituras (POST/PUT/PATCH) en "public".
  private get writeHeaders() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: environment.supabaseKey,
      Authorization: `Bearer ${environment.supabaseKey}`,
      'Content-Profile': 'public',
      // Prefer: return=representation → devuelve la fila insertada/actualizada.
      Prefer: 'return=representation',
    } as const;
  }

  // ---------------------------------------------------------------------------
  // NEWSLETTER
  // ---------------------------------------------------------------------------

  // 13) Alta sencilla de suscriptor (sin upsert ni merge-duplicates).
  async addSubscriber(email: string): Promise<ApiResult<any>> {
    try {
      const url = `${this.REST_BASE}/${encodeURIComponent(
        this.NEWSLETTER_TABLE
      )}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: this.writeHeaders,
        body: JSON.stringify({ email }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          data: null,
          error: json || { message: res.statusText },
          status: res.status,
        };
      }

      // 14) PostgREST puede devolver array; normalizamos a objeto.
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

  // 15) Listado rápido de suscriptores (útil para pruebas).
  async listSubscribers(limit = 5): Promise<ApiResult<any[]>> {
    try {
      const url =
        `${this.REST_BASE}/${encodeURIComponent(this.NEWSLETTER_TABLE)}` +
        `?select=id,email,created_at&order=created_at.desc.nullslast&limit=${limit}`;

      const res = await fetch(url, { headers: this.readHeaders });
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

  // ---------------------------------------------------------------------------
  // BLOG: POSTS (listado general y alta)
  // ---------------------------------------------------------------------------

  // 16) Listar posts (últimos primero). Seleccionamos campos seguros.
  async getPosts(limit = 10): Promise<ApiResult<Post[]>> {
    try {
      const url =
        `${this.REST_BASE}/${this.POSTS_TABLE}` +
        `?select=id,title,content,created_at,category_slug` +
        `&order=created_at.desc.nullslast&limit=${limit}`;

      const res = await fetch(url, { headers: this.readHeaders });
      const json = await res.json();

      if (!res.ok) return { data: null, error: json, status: res.status };
      return { data: json as Post[], error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }

  // 17) Crear post. Útil si quieres insertar desde el front (admin simple).
  //     - Recibe title, content, y opcionalmente categorySlug y userId.
  //     - Si tu columna user_id es NOT NULL, DEBES pasar userId válido (auth.users.id).
  async addPost(params: {
    title: string;
    content: string;
    categorySlug?: string;
    userId?: string; // obligatorio si posts.user_id es NOT NULL
  }): Promise<ApiResult<Post>> {
    const payload: any = {
      title: params.title,
      content: params.content,
    };

    if (params.categorySlug) payload.category_slug = params.categorySlug;
    if (params.userId) payload.user_id = params.userId;

    try {
      const url = `${this.REST_BASE}/${this.POSTS_TABLE}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: this.writeHeaders,
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok)
        return {
          data: null,
          error: json || { message: res.statusText },
          status: res.status,
        };

      const row = Array.isArray(json) ? json[0] : json;
      return { data: row as Post, error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // CATEGORÍAS: listado y posts por categoría
  // ---------------------------------------------------------------------------

  // 18) Listar categorías ordenadas alfabéticamente.
  async getCategories(): Promise<ApiResult<Category[]>> {
    try {
      const url =
        `${this.REST_BASE}/${this.CATEGORIES_TABLE}` +
        `?select=id,name,slug,created_at&order=name.asc.nullslast`;

      const res = await fetch(url, { headers: this.readHeaders });
      const json = await res.json();

      if (!res.ok) return { data: null, error: json, status: res.status };
      return { data: json as Category[], error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }

  // 19) Listar posts filtrando por slug de categoría.
  //     - Usamos el operador PostgREST: category_slug=eq.<valor>
  //     - Importante: encodeURIComponent en el slug por seguridad.
  async getPostsByCategory(
    slug: string,
    limit = 20
  ): Promise<ApiResult<Post[]>> {
    try {
      const url =
        `${this.REST_BASE}/${this.POSTS_TABLE}` +
        `?select=id,title,content,created_at,category_slug` +
        `&category_slug=eq.${encodeURIComponent(slug)}` +
        `&order=created_at.desc.nullslast&limit=${limit}`;

      const res = await fetch(url, { headers: this.readHeaders });
      const json = await res.json();

      if (!res.ok) return { data: null, error: json, status: res.status };
      return { data: json as Post[], error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }
}
