// src/app/pages/home/home.component.ts — Componente Standalone de la Home

// 1) Component + OnInit para cargar datos al montar la vista.
import { Component, OnInit } from '@angular/core';

// 2) CommonModule/DatePipe: *ngIf, *ngFor y pipe de fechas para la plantilla.
import { CommonModule, DatePipe } from '@angular/common';

// 3) RouterLink: permite usar [routerLink] en botones/enlaces.
import { RouterLink } from '@angular/router';

// 4) FormsModule/NgForm: para ngForm y [(ngModel)] del formulario.
import { FormsModule, NgForm } from '@angular/forms';

// 5) Servicio de datos (Supabase) y tipos fuertes.
import { SupabaseService, Post, ContactMessage } from '../../supabase.service';

@Component({
  selector: 'app-home', // 6) Selector (útil si se incrusta en otra vista).
  standalone: true, // 7) ✅ Componente standalone (sin NgModule).
  // 8) Módulos/Directivas/Pipes disponibles para el HTML de esta vista.
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './home.component.html', // 9) Plantilla asociada.
  styleUrls: ['./home.component.scss'], // 10) Estilos específicos (plural).
})
export class HomeComponent implements OnInit {
  // ===========================================================================
  // A) ESTADO DE “ÚLTIMOS ARTÍCULOS” (desde Supabase)
  // ===========================================================================
  latestPosts: Post[] = []; // 11) Guarda los posts recientes.
  postsLoading = true; // 12) Spinner de carga del bloque.
  postsError: string | null = null; // 13) Mensaje de error si la petición falla.

  // ===========================================================================
  // B) ESTADO DEL FORMULARIO DE CONTACTO (reemplaza al boletín)
  // ===========================================================================
  contact: ContactMessage = {
    // 14) Modelo de datos del formulario (two-way binding).
    name: '',
    email: '',
    subject: '',
    message: '',
  };
  sending = false; // 15) Estado de envío (deshabilita el botón).
  successMsg = ''; // 16) Mensaje de éxito para el usuario.
  errorMsg = ''; // 17) Mensaje de error (si lo hay).

  // 18) Inyectamos el servicio de Supabase.
  constructor(private readonly supabase: SupabaseService) {}

  // 19) Al montar el componente, pedimos los N últimos artículos.
  //     👉 OJO: pedimos 2 para dejar un “hueco” a la tarjeta fija de Python.
  async ngOnInit(): Promise<void> {
    await this.loadLatestPosts(2); // 19.1) Carga inicial de posts.
  }

  // 20) Carga de últimos posts con gestión de estados.
  private async loadLatestPosts(limit = 2): Promise<void> {
    this.postsLoading = true; // 20.1) Activamos loading.
    this.postsError = null; // 20.2) Limpiamos errores previos.
    this.latestPosts = []; // 20.3) Limpiamos la lista anterior.

    // 20.4) Llamada al servicio → devuelve posts ordenados por fecha desc.
    //       (En el servicio ya incluimos 'cover_url' en el SELECT).
    const { data, error } = await this.supabase.getLatestPosts(limit);

    // 20.5) Si hay error, lo mostramos y salimos.
    if (error) {
      this.postsError = error.message || 'No se pudieron cargar los artículos.';
      this.postsLoading = false;
      return;
    }

    // 20.6) Asignamos datos (o []) y desactivamos loading.
    this.latestPosts = data ?? [];
    this.postsLoading = false;
  }

  // 21) Portada a mostrar en la tarjeta:
  //     - Si el post trae 'cover_url', se usa.
  //     - Si no, devolvemos un placeholder local.
  coverFor(post: Post): string {
    return (post as any).cover_url || 'assets/img/placeholder-article.jpg';
  }

  // 22) Enlace del botón “Leer más”:
  //     - Si hay category_slug → /categorias/:slug
  //     - Si no, fallback a /articulos
  readMoreLink(post: Post): any[] {
    return (post as any).category_slug
      ? ['/categorias', (post as any).category_slug]
      : ['/articulos'];
  }

  // 23) trackBy para *ngFor (mejora rendimiento al no recrear DOM si no cambia el id).
  trackById(_i: number, p: Post): string {
    return p.id;
  }

  // ===========================================================================
  // C) LÓGICA DEL FORMULARIO DE CONTACTO (sustituye al newsletter)
  // ===========================================================================

  // 24) Envío del formulario de contacto (Template-driven).
  //     - Recibimos la referencia del formulario para validar con `f.invalid`.
  async onSendMessage(f: NgForm): Promise<void> {
    this.successMsg = ''; // 24.1) Limpiar estados previos.
    this.errorMsg = '';

    if (f.invalid) return; // 24.2) Si el formulario es inválido, no enviamos.

    this.sending = true; // 24.3) Activamos estado de envío (UI).
    try {
      // 24.4) Llamada al servicio → inserta en la tabla `contact_messages`.
      const { error } = await this.supabase.sendContactMessage(this.contact);

      if (!error) {
        // 24.5) Caso OK → limpiamos el modelo y mostramos confirmación.
        this.contact = { name: '', email: '', subject: '', message: '' };
        f.resetForm(); // 24.6) Reset visual de controles/validación.
        this.successMsg = '¡Mensaje enviado! Gracias por tu feedback 🙌';
        return;
      }

      // 24.7) Si hubiera error en la respuesta REST (no debería llegar aquí con try/catch).
      this.errorMsg = error.message || 'No se pudo enviar el mensaje.';
    } catch (e: any) {
      // 24.8) Errores de red u otros no-HTTP.
      this.errorMsg = e?.message || 'Error de conexión. Inténtalo de nuevo.';
      console.error('Contact error:', e);
    } finally {
      this.sending = false; // 24.9) Desactivamos el estado de envío.
    }
  }
}
