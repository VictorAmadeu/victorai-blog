// src/app/supabase.service.ts
// Servicio central para comunicar Angular con Supabase usando la API REST (PostgREST).
// Mantiene un estilo consistente con el proyecto: fetch + cabeceras + manejo de errores.

/* -------------------------------------------------------------------------- */
/*  IMPORTS Y CONFIGURACIÓN BÁSICA                                            */
/* -------------------------------------------------------------------------- */

// 1) Angular: hacemos el servicio inyectable a nivel global (raíz del inyector).
import { Injectable } from '@angular/core';

// 2) SDK de Supabase: lo inicializamos (aunque la mayoría de llamadas las hacemos por REST).
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 3) Variables de entorno (URL del proyecto y clave pública "anon").
import { environment } from '../environments/environment';

/* -------------------------------------------------------------------------- */
/*  TIPOS UTILITARIOS PARA RESPUESTAS REST                                     */
/* -------------------------------------------------------------------------- */

// 4) Estructura de error “amigable” que PostgREST puede devolver.
type ApiError = {
  message?: string; // Mensaje legible
  code?: string; // Código de error (p.ej. '23505' para unique violation)
  details?: string; // Detalles técnicos
  hint?: string; // Sugerencias del servidor
};

// 5) Envoltorio genérico de resultados: datos | error | status HTTP.
//    Esto nos permite tipar el "data" y centralizar el manejo de errores.
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
  content: string; // cuerpo en Markdown/HTML renderizable
  category_slug?: string; // relación simple con categories.slug
  cover_url?: string | null; // 👈 URL de portada (puede ser null)
  user_id?: string | null; // autor (si aplicas auth/RLS)
  created_at?: string; // timestamp
  // Si más adelante añades excerpt, tags, etc., amplías este tipo.
};

/* -------------------------------------------------------------------------- */
/*  NUEVO: TIPO PARA MENSAJES DE CONTACTO                                     */
/* -------------------------------------------------------------------------- */

// 7.1) Mensaje de contacto que enviará el formulario público.
export type ContactMessage = {
  name: string; // Nombre del remitente
  email: string; // Correo del remitente
  subject: string; // Asunto
  message: string; // Cuerpo del mensaje
};

/* -------------------------------------------------------------------------- */
/*  SERVICIO                                                                   */
/* -------------------------------------------------------------------------- */

// 8) Registramos el servicio en el inyector raíz de Angular.
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  // 9) Cliente oficial de Supabase (útil si luego haces auth, storage, RPC...).
  private client: SupabaseClient;

  // 10) Nombres de tablas y base URL REST (PostgREST) para construir endpoints.
  private readonly NEWSLETTER_TABLE = 'newsletter_subscribers';
  private readonly POSTS_TABLE = 'posts';
  private readonly CATEGORIES_TABLE = 'categories';

  // 10.1) NUEVO: tabla para el formulario de contacto.
  //       ⚠️ Recuerda: con RLS activo solo hemos creado política de INSERT (no SELECT).
  private readonly CONTACT_TABLE = 'contact_messages';

  // 10.2) Base de la API REST de Supabase (PostgREST).
  private readonly REST_BASE = `${environment.supabaseUrl}/rest/v1`;

  constructor() {
    // 11) Inicializamos el cliente con opciones “ligeras”.
    //     - No persistimos sesión ni auto-refresh (evita locks en SSR/build).
    //     - Añadimos cabeceras globales para que el SDK herede la apikey.
    this.client = createClient(
      environment.supabaseUrl, // URL de tu proyecto
      environment.supabaseKey, // clave pública "anon"
      {
        auth: {
          persistSession: false, // no guarda sesión en localStorage
          autoRefreshToken: false, // no renueva tokens en background
          detectSessionInUrl: false, // no intenta leer sesión de la URL
        },
        global: {
          headers: {
            apikey: environment.supabaseKey, // clave de proyecto
            Authorization: `Bearer ${environment.supabaseKey}`, // bearer para REST
          },
        },
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /*  UTILIDADES INTERNAS: CABECERAS REST                                     */
  /* ------------------------------------------------------------------------ */

  // 12) Cabeceras estándar de LECTURA (GET) en el esquema `public`.
  private get readHeaders() {
    return {
      Accept: 'application/json', // pedimos JSON
      apikey: environment.supabaseKey, // clave pública
      Authorization: `Bearer ${environment.supabaseKey}`, // bearer
      'Accept-Profile': 'public', // esquema de lectura
    } as const;
  }

  // 13) Cabeceras estándar de ESCRITURA (POST/PATCH) en el esquema `public`.
  private get writeHeaders() {
    return {
      'Content-Type': 'application/json', // enviamos JSON
      Accept: 'application/json', // esperamos JSON
      apikey: environment.supabaseKey, // clave pública
      Authorization: `Bearer ${environment.supabaseKey}`, // bearer
      'Content-Profile': 'public', // esquema de escritura
      // Prefer: return=representation → PostgREST devuelve la fila afectada.
      Prefer: 'return=representation',
    } as const;
  }

  /* ------------------------------------------------------------------------ */
  /*  NEWSLETTER                                                              */
  /* ------------------------------------------------------------------------ */

  // 14) Alta sencilla de suscriptor.
  async addSubscriber(email: string): Promise<ApiResult<any>> {
    try {
      // 14.1) Construimos la URL del recurso (tabla newsletter_subscribers).
      const url = `${this.REST_BASE}/${encodeURIComponent(
        this.NEWSLETTER_TABLE
      )}`;

      // 14.2) Hacemos POST con el email en el cuerpo.
      const res = await fetch(url, {
        method: 'POST',
        headers: this.writeHeaders,
        body: JSON.stringify({ email }),
      });

      // 14.3) Intentamos parsear el JSON (si falla, devolvemos null).
      const json = await res.json().catch(() => null);

      // 14.4) Si el estado HTTP no es OK, devolvemos el error normalizado.
      if (!res.ok) {
        return {
          data: null,
          error: json || { message: res.statusText },
          status: res.status,
        };
      }

      // 14.5) PostgREST a veces responde con array → normalizamos a objeto.
      const row = Array.isArray(json) ? json[0] : json;
      return { data: row, error: null, status: res.status };
    } catch (e: any) {
      // 14.6) Errores de red u otros no-HTTP.
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
      // 15.1) SELECT con orden por fecha descendente y límite.
      const url =
        `${this.REST_BASE}/${encodeURIComponent(this.NEWSLETTER_TABLE)}` +
        `?select=id,email,created_at&order=created_at.desc.nullslast&limit=${limit}`;

      // 15.2) GET con cabeceras de lectura.
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
  /*  BLOG: POSTS (listado general y creación)                                 */
  /* ------------------------------------------------------------------------ */

  // 16) Listar posts (últimos primero). 👈 Incluimos cover_url en el SELECT.
  async getPosts(limit = 10): Promise<ApiResult<Post[]>> {
    try {
      // 16.1) SELECT con orden por fecha y límite.
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

  /* ------------------------------------------------------------------------ */
  /*  CATEGORÍAS (listado y consultas)                                        */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /*  NUEVO: FORMULARIO DE CONTACTO                                           */
  /* ------------------------------------------------------------------------ */

  // 22) Enviar un mensaje de contacto a la tabla `contact_messages`.
  //     — Normalizamos campos (trim y email en minúsculas).
  //     — Usamos POST con cabeceras de escritura (RLS debe permitir INSERT a 'anon').
  //     — Por seguridad y privacidad: NO implementamos un método de lectura en el cliente.
  async sendContactMessage(
    input: ContactMessage
  ): Promise<ApiResult<ContactMessage>> {
    try {
      // 22.1) Normalizamos datos antes de enviarlos.
      const payload: ContactMessage = {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        subject: input.subject.trim(),
        message: input.message.trim(),
      };

      // 22.2) Construimos endpoint REST de la tabla `contact_messages`.
      const url = `${this.REST_BASE}/${encodeURIComponent(this.CONTACT_TABLE)}`;

      // 22.3) Hacemos POST; Prefer: return=representation nos devuelve la fila insertada.
      const res = await fetch(url, {
        method: 'POST',
        headers: this.writeHeaders,
        body: JSON.stringify(payload),
      });

      // 22.4) Parseo del JSON devuelto por PostgREST.
      const json = await res.json().catch(() => null);

      // 22.5) Si falla la petición, devolvemos error con status y detalle del servidor.
      if (!res.ok) {
        return {
          data: null,
          error: json || { message: res.statusText },
          status: res.status,
        };
      }

      // 22.6) Normalizamos a objeto simple (PostgREST a veces devuelve array).
      const row = (Array.isArray(json) ? json[0] : json) as ContactMessage;
      return { data: row, error: null, status: res.status };
    } catch (e: any) {
      // 22.7) Errores de red u otros no-HTTP.
      return {
        data: null,
        error: { message: e?.message || 'network error' },
        status: 0,
      };
    }
  }
}
// 23) Fin del servicio SupabaseService.
//     A partir de aquí, ya puedes inyectar el servicio en tu componente y llamar a `sendContactMessage(...)`.
