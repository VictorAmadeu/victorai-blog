// src/app/pages/home/home.component.ts — Componente Standalone de la Home
// Nota: Para “Opción A (Bootstrap Icons)” no se importan librerías en TS.
// Los íconos son CSS/HTML (clases .bi...) ya añadidas en angular.json.

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

// 6) UI Kit standalone: tarjeta y skeleton (se usan en el HTML de Home).
import { UiCardComponent } from '../../ui/ui-card/ui-card.component';
import { SkeletonComponent } from '../../ui/skeleton/skeleton.component';

@Component({
  selector: 'app-home', // 7) Selector de este componente.
  standalone: true, // 8) Standalone (sin NgModule).
  // 9) Conjunto de directivas/pipes/componentes disponibles en el template.
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DatePipe,
    UiCardComponent,
    SkeletonComponent,
  ],
  templateUrl: './home.component.html', // 10) Plantilla asociada.
  styleUrls: ['./home.component.scss'], // 11) Estilos específicos.
})
export class HomeComponent implements OnInit {
  // ===========================================================================
  // A) ESTADO DE “ÚLTIMOS ARTÍCULOS” (desde Supabase)
  // ===========================================================================
  latestPosts: Post[] = []; // 12) Lista de posts recientes.
  postsLoading = true; // 13) Activa skeletons mientras carga.
  postsError: string | null = null; // 14) Mensaje de error si falla.

  // ===========================================================================
  // B) ESTADO DEL FORMULARIO DE CONTACTO
  // ===========================================================================
  contact: ContactMessage = {
    // 15) Modelo del formulario.
    name: '',
    email: '',
    subject: '',
    message: '',
  };
  sending = false; // 16) Estado de envío.
  successMsg = ''; // 17) Mensaje de éxito.
  errorMsg = ''; // 18) Mensaje de error.

  // 19) Inyectamos el servicio de Supabase.
  constructor(private readonly supabase: SupabaseService) {}

  // 20) Al montar el componente, pedimos los N últimos artículos.
  async ngOnInit(): Promise<void> {
    await this.loadLatestPosts(2); // 20.1) Pedimos 2 (dejamos hueco a la tarjeta fija de Python).
  }

  // 21) Carga de últimos posts con gestión de estados.
  private async loadLatestPosts(limit = 2): Promise<void> {
    this.postsLoading = true; // 21.1) Muestra skeletons.
    this.postsError = null; // 21.2) Limpia errores previos.
    this.latestPosts = []; // 21.3) Limpia la lista.

    // 21.4) Petición al servicio (ya incluye 'cover_url' en el SELECT).
    const { data, error } = await this.supabase.getLatestPosts(limit);

    if (error) {
      // 21.5) Manejo de error.
      this.postsError = error.message || 'No se pudieron cargar los artículos.';
      this.postsLoading = false;
      return;
    }

    this.latestPosts = data ?? []; // 21.6) Asigna datos.
    this.postsLoading = false; // 21.7) Oculta skeletons.
  }

  // 22) Portada a mostrar en la tarjeta:
  //     - Si el post trae 'cover_url', se usa; si no, placeholder local.
  coverFor(post: Post): string {
    // (Post de Supabase puede traer 'cover_url' sin estar tipado en la interfaz)
    return (post as any)?.cover_url || 'assets/img/placeholder-article.jpg';
  }

  // 23) Helper: devuelve el slug de categoría (o null si no existe).
  categorySlug(post: Post): string | null {
    return (post as any)?.category_slug ?? null;
  }

  // 24) Helper: humaniza un slug ("deep-learning" → "deep learning").
  slugLabel(slug: string): string {
    return slug.replace(/-/g, ' ');
  }

  // 25) Enlace del botón “Leer más”:
  //     - Si hay category_slug → /categorias/:slug
  //     - Si no, fallback a /articulos
  readMoreLink(post: Post): any[] {
    const slug = this.categorySlug(post);
    return slug ? ['/categorias', slug] : ['/articulos'];
  }

  // 26) trackBy para *ngFor (mejora rendimiento).
  trackById(_i: number, p: Post): string {
    return p.id;
  }

  // ===========================================================================
  // C) LÓGICA DEL FORMULARIO DE CONTACTO
  // ===========================================================================
  async onSendMessage(f: NgForm): Promise<void> {
    this.successMsg = ''; // 27.1) Limpia estados previos.
    this.errorMsg = '';

    if (f.invalid) return; // 27.2) No enviar si inválido.

    this.sending = true; // 27.3) Activa estado de envío.
    try {
      const { error } = await this.supabase.sendContactMessage(this.contact); // 27.4) Inserta en Supabase.

      if (!error) {
        // 27.5) OK → reseteo + feedback.
        this.contact = { name: '', email: '', subject: '', message: '' };
        f.resetForm();
        this.successMsg = '¡Mensaje enviado! Gracias por tu feedback 🙌';
        return;
      }

      this.errorMsg = error.message || 'No se pudo enviar el mensaje.'; // 27.6) Error de backend.
    } catch (e: any) {
      this.errorMsg = e?.message || 'Error de conexión. Inténtalo de nuevo.'; // 27.7) Error inesperado.
      console.error('Contact error:', e);
    } finally {
      this.sending = false; // 27.8) Desactiva estado de envío.
    }
  }
}
