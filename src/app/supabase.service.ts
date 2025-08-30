// src/app/supabase.service.ts

// 1) Angular: hacemos el servicio inyectable a nivel global (raíz del inyector).
import { Injectable } from '@angular/core';

// 2) SDK de Supabase: lo inicializamos (aunque aquí usamos REST con fetch).
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 3) Variables de entorno (tu URL y la anon key).
import { environment } from '../environments/environment';

// -----------------------------------------------------------------------------
// TIPOS UTILITARIOS PARA RESPUESTAS REST
// -----------------------------------------------------------------------------

// 4) Estructura de error “amigable” que PostgREST puede devolver.
type ApiError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

// 5) Envoltorio genérico de resultados: datos | error | status HTTP.
type ApiResult<T> = { data: T | null; error: ApiError | null; status?: number };

// -----------------------------------------------------------------------------
// TIPOS DE DOMINIO DEL BLOG
// -----------------------------------------------------------------------------

// 6) Categoría: filas de la tabla `categories`.
export type Category = {
  id: string; // uuid
  name: string; // p.ej. "Ingeniería de IA"
  slug: string; // p.ej. "ingenieria-de-ia"
  created_at?: string; // timestamp (opcional)
};

// 7) Post: filas de la tabla `posts`.
export type Post = {
  id: string; // uuid
  title: string; // título del artículo
  content: string; // cuerpo en Markdown/HTML renderizable
  category_slug?: string; // relación simple con categories.slug
  cover_url?: string | null; // 👈 URL de portada (puede ser null)
  user_id?: string | null; // autor (si aplicas auth/RLS)
  created_at?: string; // timestamp
  // Si más adelante añades excerpt, tags, etc., amplías este tipo.
};

// -----------------------------------------------------------------------------
// SERVICIO
// -----------------------------------------------------------------------------

// 8) Registramos el servicio en el inyector raíz de Angular.
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // 9) Cliente oficial de Supabase (útil si luego haces auth, storage, RPC...).
  private client: SupabaseClient;

  // 10) Nombres de tablas y base URL REST (PostgREST) para construir endpoints.
  private readonly NEWSLETTER_TABLE = 'newsletter_subscribers';
  private readonly POSTS_TABLE = 'posts';
  private readonly CATEGORIES_TABLE = 'categories';
  private readonly REST_BASE = `${environment.supabaseUrl}/rest/v1`;

  constructor() {
    // 11) Inicializamos el cliente con opciones “ligeras”
    //     - No persistimos sesión ni auto-refresh (evita locks en SSR/build)
    //     - Añadimos cabeceras globales para que el SDK REST herede la apikey.
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
  // UTILIDADES INTERNAS: CABECERAS REST
  // ---------------------------------------------------------------------------

  // 12) Cabeceras estándar de LECTURA (GET) en el esquema `public`.
  private get readHeaders() {
    return {
      Accept: 'application/json',
      apikey: environment.supabaseKey,
      Authorization: `Bearer ${environment.supabaseKey}`,
      'Accept-Profile': 'public',
    } as const;
  }

  // 13) Cabeceras estándar de ESCRITURA (POST/PATCH) en el esquema `public`.
  private get writeHeaders() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: environment.supabaseKey,
      Authorization: `Bearer ${environment.supabaseKey}`,
      'Content-Profile': 'public',
      // Prefer: return=representation → PostgREST devuelve la fila afectada.
      Prefer: 'return=representation',
    } as const;
  }

  // ---------------------------------------------------------------------------
  // NEWSLETTER
  // ---------------------------------------------------------------------------

  // 14) Alta sencilla de suscriptor.
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

      // PostgREST a veces responde con array → normalizamos a objeto.
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
  // BLOG: POSTS (listado general y creación)
  // ---------------------------------------------------------------------------

  // 16) Listar posts (últimos primero). 👈 Incluimos cover_url en el SELECT.
  async getPosts(limit = 10): Promise<ApiResult<Post[]>> {
    try {
      const url =
        `${this.REST_BASE}/${this.POSTS_TABLE}` +
        `?select=id,title,content,created_at,category_slug,cover_url` + // ← cover_url
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

  // 17) Crear post desde el front (mini “admin”).
  //     Admitimos coverUrl para guardar la portada.
  //     ⚠️ Si `posts.user_id` es NOT NULL, debes pasar un `userId` válido.
  async addPost(params: {
    title: string;
    content: string;
    categorySlug?: string;
    coverUrl?: string | null; // ← portada opcional
    userId?: string; // obligatorio si hay NOT NULL en la tabla
  }): Promise<ApiResult<Post>> {
    // 17.1) Construimos payload sólo con campos presentes.
    const payload: any = {
      title: params.title,
      content: params.content,
    };
    if (params.categorySlug) payload.category_slug = params.categorySlug;
    if (typeof params.coverUrl !== 'undefined')
      payload.cover_url = params.coverUrl;
    if (params.userId) payload.user_id = params.userId;

    try {
      const url = `${this.REST_BASE}/${this.POSTS_TABLE}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: this.writeHeaders,
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        return {
          data: null,
          error: json || { message: res.statusText },
          status: res.status,
        };
      }

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

  // (Opcional) 18) Helper para pedir los N últimos posts (alias semántico).
  // Reutiliza getPosts pero deja clara la intención en Home.
  async getLatestPosts(limit = 3): Promise<ApiResult<Post[]>> {
    return this.getPosts(limit);
  }

  // ---------------------------------------------------------------------------
  // CATEGORÍAS (PRO): listado, detalle por slug y posts por categoría
  // ---------------------------------------------------------------------------

  // 19) Listar categorías ordenadas alfabéticamente.
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

  // 20) Obtener la categoría por su slug desde la BD.
  //     Se usa para mostrar el nombre oficial en la cabecera de la página.
  async getCategoryBySlug(slug: string): Promise<ApiResult<Category | null>> {
    try {
      const url =
        `${this.REST_BASE}/${this.CATEGORIES_TABLE}` +
        `?select=id,slug,name,created_at` +
        `&slug=eq.${encodeURIComponent(slug)}` +
        `&limit=1`;

      const res = await fetch(url, { headers: this.readHeaders });
      const json = await res.json();

      if (!res.ok) return { data: null, error: json, status: res.status };

      const row = (Array.isArray(json) ? json[0] : json) ?? null;
      return { data: row as Category | null, error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }

  // 21) Listar posts filtrando por slug de categoría.
  //     👈 También incluimos cover_url en el SELECT.
  async getPostsByCategory(
    slug: string,
    limit = 20
  ): Promise<ApiResult<Post[]>> {
    try {
      const url =
        `${this.REST_BASE}/${this.POSTS_TABLE}` +
        `?select=id,title,content,created_at,category_slug,cover_url` + // ← cover_url
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
// 22) Fin del servicio SupabaseService.