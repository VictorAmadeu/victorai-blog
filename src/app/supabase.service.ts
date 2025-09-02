// src/app/supabase.service.ts
// Servicio central para comunicar Angular con Supabase.
// - Usamos REST (fetch + PostgREST) para la mayoría de lecturas/escrituras.
// - Para el formulario de contacto usamos el SDK oficial supabase-js (INSERT robusto)
//   y SIN pedir representación (evita SELECT implícito y, por tanto, 401/RLS).

/* -------------------------------------------------------------------------- */
/*  IMPORTS Y CONFIGURACIÓN BÁSICA                                            */
/* -------------------------------------------------------------------------- */

// 1) Angular: hacemos el servicio inyectable a nivel global (raíz del inyector).
import { Injectable } from '@angular/core';

// 2) SDK de Supabase: cliente oficial para DB/Auth/Storage.
//    👇 Lo usaremos en el INSERT de contacto (sin .select()).
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 3) Variables de entorno: URL del proyecto y clave pública "anon".
import { environment } from '../environments/environment';

/* -------------------------------------------------------------------------- */
/*  TIPOS UTILITARIOS PARA RESPUESTAS/ERRORES                                 */
/* -------------------------------------------------------------------------- */

// 4) Estructura de error (PostgREST / supabase-js).
type ApiError = {
  message?: string; // Mensaje legible
  code?: string; // Código (p.ej., '23505' unique-violation)
  details?: string; // Detalles adicionales
  hint?: string; // Pista del servidor
};

// 5) Envoltorio genérico de resultados: datos | error | status HTTP.
type ApiResult<T> = { data: T | null; error: ApiError | null; status?: number };

/* -------------------------------------------------------------------------- */
/*  TIPOS DE DOMINIO DEL BLOG                                                 */
/* -------------------------------------------------------------------------- */

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
  content: string; // cuerpo en Markdown/HTML
  category_slug?: string; // relación con categories.slug
  cover_url?: string | null; // portada (nullable)
  user_id?: string | null; // autor (si aplicas auth/RLS)
  created_at?: string; // timestamp
};

/* -------------------------------------------------------------------------- */
/*  TIPO PARA MENSAJES DE CONTACTO                                            */
/* -------------------------------------------------------------------------- */

// 7.1) Mensaje enviado desde el formulario público.
export type ContactMessage = {
  name: string; // Nombre del remitente
  email: string; // Correo del remitente
  subject: string; // Asunto
  message: string; // Cuerpo del mensaje
  // La tabla puede tener id/created_at; no los necesitamos en el front.
};

/* -------------------------------------------------------------------------- */
/*  SERVICIO                                                                   */
/* -------------------------------------------------------------------------- */

// 8) Registramos el servicio en el inyector raíz de Angular.
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // 9) Cliente oficial de Supabase (lo usaremos para el INSERT del contacto).
  private client: SupabaseClient;

  // 10) Nombres de tablas y base REST (PostgREST) para endpoints.
  private readonly NEWSLETTER_TABLE = 'newsletter_subscribers';
  private readonly POSTS_TABLE = 'posts';
  private readonly CATEGORIES_TABLE = 'categories';
  private readonly CONTACT_TABLE = 'contact_messages'; // 👈 tabla del formulario

  // 10.1) Base REST.
  private readonly REST_BASE = `${environment.supabaseUrl}/rest/v1`;

  constructor() {
    // 11) Inicialización del cliente con opciones “ligeras”.
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          persistSession: false, // no guardamos sesión en localStorage
          autoRefreshToken: false, // sin auto-refresh
          detectSessionInUrl: false, // no lee sesión de la URL
        },
        global: {
          headers: {
            apikey: environment.supabaseKey, // apikey pública
            Authorization: `Bearer ${environment.supabaseKey}`, // bearer
          },
        },
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  CABECERAS REST (LECTURA/ESCRITURA)                                      */
  /* ------------------------------------------------------------------------ */

  // 12) Cabeceras de LECTURA (GET) en el esquema `public`.
  private get readHeaders() {
    return {
      Accept: 'application/json',
      apikey: environment.supabaseKey,
      Authorization: `Bearer ${environment.supabaseKey}`,
      'Accept-Profile': 'public',
    } as const;
  }

  // 13) Cabeceras de ESCRITURA (POST/PATCH) en `public`.
  private get writeHeaders() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      apikey: environment.supabaseKey,
      Authorization: `Bearer ${environment.supabaseKey}`,
      'Content-Profile': 'public',
      Prefer: 'return=representation', // para endpoints REST donde sí queremos la fila
    } as const;
  }

  /* ------------------------------------------------------------------------ */
  /*  NEWSLETTER (REST)                                                       */
  /* ------------------------------------------------------------------------ */

  // 14) Alta de suscriptor (REST).
  async addSubscriber(email: string): Promise<ApiResult<any>> {
    try {
      const url = `${this.REST_BASE}/${encodeURIComponent(
        this.NEWSLETTER_TABLE
      )}`; // endpoint
      const res = await fetch(url, {
        method: 'POST',
        headers: this.writeHeaders,
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => null); // parse seguro

      if (!res.ok) {
        return {
          data: null,
          error: json || { message: res.statusText },
          status: res.status,
        };
      }

      const row = Array.isArray(json) ? json[0] : json; // normaliza array/objeto
      return { data: row, error: null, status: res.status };
    } catch (e: any) {
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }

  // 15) Listado rápido de suscriptores (REST).
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

  /* ------------------------------------------------------------------------ */
  /*  BLOG: POSTS (REST)                                                      */
  /* ------------------------------------------------------------------------ */

  // 16) Listar posts (últimos primero). Incluye cover_url.
  async getPosts(limit = 10): Promise<ApiResult<Post[]>> {
    try {
      const url =
        `${this.REST_BASE}/${this.POSTS_TABLE}` +
        `?select=id,title,content,created_at,category_slug,cover_url` +
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

  // 17) Crear post desde el front (REST).
  async addPost(params: {
    title: string;
    content: string;
    categorySlug?: string;
    coverUrl?: string | null;
    userId?: string;
  }): Promise<ApiResult<Post>> {
    // 17.1) Payload solo con campos presentes.
    const payload: any = { title: params.title, content: params.content };
    if (params.categorySlug) payload.category_slug = params.categorySlug;
    if (typeof params.coverUrl !== 'undefined')
      payload.cover_url = params.coverUrl;
    if (params.userId) payload.user_id = params.userId;

    try {
      const url = `${this.REST_BASE}/${this.POSTS_TABLE}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: this.writeHeaders, // aquí sí queremos 'return=representation'
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

  // 18) Alias semántico para pedir los N últimos posts.
  async getLatestPosts(limit = 3): Promise<ApiResult<Post[]>> {
    return this.getPosts(limit);
  }

  /* ------------------------------------------------------------------------ */
  /*  CATEGORÍAS (REST)                                                       */
  /* ------------------------------------------------------------------------ */

  // 19) Listar categorías (orden alfabético).
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

  // 20) Obtener categoría por slug.
  async getCategoryBySlug(slug: string): Promise<ApiResult<Category | null>> {
    try {
      const url =
        `${this.REST_BASE}/${this.CATEGORIES_TABLE}` +
        `?select=id,slug,name,created_at&slug=eq.${encodeURIComponent(
          slug
        )}&limit=1`;
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

  // 21) Listar posts por slug de categoría (incluye cover_url).
  async getPostsByCategory(
    slug: string,
    limit = 20
  ): Promise<ApiResult<Post[]>> {
    try {
      const url =
        `${this.REST_BASE}/${this.POSTS_TABLE}` +
        `?select=id,title,content,created_at,category_slug,cover_url` +
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

  /* ------------------------------------------------------------------------ */
  /*  FORMULARIO DE CONTACTO (SDK supabase-js, SIN representación)            */
  /* ------------------------------------------------------------------------ */

  // 22) Enviar un mensaje de contacto a `contact_messages` SIN pedir la fila creada.
  //     - Evita el SELECT implícito (por eso no usamos .select()).
  //     - Con RLS basta con tener política INSERT para 'anon' (y opcional 'authenticated').
  //     - Devolvemos { data: null } en éxito; el front solo necesita saber que fue OK.
  async sendContactMessage(input: ContactMessage): Promise<ApiResult<null>> {
    // 22.1) Normaliza el payload antes de enviarlo.
    const payload: ContactMessage = {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      subject: input.subject.trim(),
      message: input.message.trim(),
    };

    // 22.2) INSERT con supabase-js SIN .select()  → return=minimal (sin SELECT).
    const { error, status } = await this.client
      .from(this.CONTACT_TABLE) // tabla destino
      .insert(payload); // operación INSERT (sin select)

    // 22.3) Si hay error, lo mapeamos a nuestro ApiError consistente.
    if (error) {
      const mapped: ApiError = {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      };
      return { data: null, error: mapped, status };
    }

    // 22.4) OK → sin datos de vuelta (evitamos SELECT). El componente verá error=null.
    return { data: null, error: null, status };
  }
}
// 23) Fin del servicio SupabaseService.
