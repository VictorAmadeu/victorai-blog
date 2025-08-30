// src/app/pages/home/home.component.ts — Componente Standalone de la Home

// 1) Component + OnInit para cargar datos al montar la vista.
import { Component, OnInit } from '@angular/core';

// 2) CommonModule/DatePipe: *ngIf, *ngFor y pipe de fechas para la plantilla.
import { CommonModule, DatePipe } from '@angular/common';

// 3) RouterLink: permite usar [routerLink] en botones/enlaces.
import { RouterLink } from '@angular/router';

// 4) FormsModule: para ngForm y [(ngModel)] del formulario de newsletter.
import { FormsModule } from '@angular/forms';

// 5) Servicio de datos (Supabase) y tipo Post para tipado fuerte.
import { SupabaseService, Post } from '../../supabase.service';

@Component({
  selector: 'app-home', // 6) Selector (útil si se incrusta en otra vista).
  standalone: true, // 7) ✅ Sin NgModule (Standalone).
  // 8) Módulos/Directivas/Pipes disponibles para el HTML de esta vista.
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  templateUrl: './home.component.html', // 9) Plantilla asociada.
  styleUrls: ['./home.component.scss'], // 10) Estilos específicos (plural).
})
export class HomeComponent implements OnInit {
  // ===========================================================================
  // A) ESTADO DEL NEWSLETTER
  // ===========================================================================
  newsletterEmail = ''; // 11) Modelo enlazado al input de email.
  loading = false; // 12) Estado mientras enviamos la suscripción.

  // ===========================================================================
  // B) ESTADO DE “ÚLTIMOS ARTÍCULOS” (desde Supabase)
  // ===========================================================================
  latestPosts: Post[] = []; // 13) Guarda los posts recientes.
  postsLoading = true; // 14) Spinner de carga del bloque.
  postsError: string | null = null; // 15) Mensaje de error si la petición falla.

  // 16) Inyectamos el servicio de Supabase.
  constructor(private readonly supabase: SupabaseService) {}

  // 17) Al montar el componente, pedimos los N últimos artículos.
  //     👉 OJO: pedimos 2 para dejar un “hueco” a la tarjeta fija de Python.
  async ngOnInit(): Promise<void> {
    await this.loadLatestPosts(2);
  }

  // 18) Carga de últimos posts con gestión de estados.
  private async loadLatestPosts(limit = 2): Promise<void> {
    this.postsLoading = true; // 18.1) Activamos loading.
    this.postsError = null; // 18.2) Limpiamos errores previos.
    this.latestPosts = []; // 18.3) Limpiamos la lista anterior.

    // 18.4) Llamada al servicio → devuelve posts ordenados por fecha desc.
    //       (En el servicio ya incluimos 'cover_url' en el SELECT).
    const { data, error } = await this.supabase.getLatestPosts(limit);

    // 18.5) Si hay error, lo mostramos y salimos.
    if (error) {
      this.postsError = error.message || 'No se pudieron cargar los artículos.';
      this.postsLoading = false;
      return;
    }

    // 18.6) Asignamos datos (o []) y desactivamos loading.
    this.latestPosts = data ?? [];
    this.postsLoading = false;
  }

  // 19) Portada a mostrar en la tarjeta:
  //     - Si el post trae 'cover_url', se usa.
  //     - Si no, devolvemos un placeholder local.
  coverFor(post: Post): string {
    return (post as any).cover_url || 'assets/img/placeholder-article.jpg';
  }

  // 20) Enlace del botón “Leer más”:
  //     - Si hay category_slug → /categorias/:slug
  //     - Si no, fallback a /articulos
  readMoreLink(post: Post): any[] {
    return (post as any).category_slug
      ? ['/categorias', (post as any).category_slug]
      : ['/articulos'];
  }

  // 21) trackBy para *ngFor (mejora rendimiento al no recrear DOM si no cambia el id).
  trackById(_i: number, p: Post): string {
    return p.id;
  }

  // ===========================================================================
  // C) LÓGICA DEL FORMULARIO DE NEWSLETTER
  // ===========================================================================
  // 22) Envío del formulario de newsletter.
  async onSubscribe(): Promise<void> {
    // 22.1) Normalizamos y validamos el email.
    const email = this.newsletterEmail.trim().toLowerCase();
    if (!email) return;

    this.loading = true; // 22.2) Activamos el estado de envío.

    // 22.3) Insertamos el email en Supabase (tabla newsletter_subscribers).
    const { data, error, status } = await this.supabase.addSubscriber(email);

    this.loading = false; // 22.4) Finalizamos el estado de envío.

    // 22.5) Caso OK → limpiamos y confirmamos al usuario.
    if (!error) {
      this.newsletterEmail = '';
      alert(`¡Gracias! Te has suscrito con: ${data?.email || email}`);
      return;
    }

    // 22.6) Si es violación de UNIQUE (email ya suscrito), mensaje claro.
    if (
      error?.code === '23505' ||
      /duplicate|unique/i.test(error?.message || '')
    ) {
      this.newsletterEmail = '';
      alert('Ese correo ya está suscrito ✅');
      return;
    }

    // 22.7) Cualquier otro error → log técnico + alerta al usuario.
    console.error('Error al suscribir:', { error, status });
    alert(
      `No se pudo suscribir: ${error?.message || 'Error desconocido'}${
        status ? ' (HTTP ' + status + ')' : ''
      }`
    );
  }
}
