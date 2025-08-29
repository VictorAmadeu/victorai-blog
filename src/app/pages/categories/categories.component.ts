// src/app/pages/categories/categories.component.ts

// 1) Importamos símbolos de Angular necesarios para un componente Standalone.
import { Component, OnInit, inject } from '@angular/core';

// 2) CommonModule → directivas estructurales (*ngIf, *ngFor).
import { CommonModule } from '@angular/common';

// 3) RouterLink → poder usar [routerLink] en el HTML para navegar a /categorias/:slug.
import { RouterLink } from '@angular/router';

// 4) Importamos nuestro servicio de Supabase y el tipo Category para tipar datos.
import { SupabaseService } from '../../supabase.service';
import type { Category } from '../../supabase.service';

// 5) Decorador @Component: definimos un componente Standalone.
@Component({
  // 5.1) selector: etiqueta HTML si quisiéramos incrustarlo (no imprescindible para rutas).
  selector: 'app-categories',

  // 5.2) standalone: true → no usamos NgModule, el componente se auto-declara.
  standalone: true,

  // 5.3) imports: módulos/directivas que usaremos en la PLANTILLA (HTML).
  //      - CommonModule: *ngIf, *ngFor, etc.
  //      - RouterLink: [routerLink] para enlaces internos.
  imports: [CommonModule, RouterLink],

  // 5.4) templateUrl/styleUrl: archivos de vista y estilos del componente.
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  // 6) Inyección del servicio de Supabase usando la función inject (Angular moderno).
  private readonly supa = inject(SupabaseService);

  // 7) Estado público que el HTML utilizará para pintar la vista:
  //    - categories: array con las categorías traídas de Supabase.
  //    - loading: indicador de carga (mientras llega la respuesta).
  //    - error: mensaje si algo falla (RLS, red, etc.).
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  // 8) Ciclo de vida: al inicializar el componente, cargamos las categorías.
  async ngOnInit(): Promise<void> {
    await this.loadCategories();
  }

  // 9) Método principal: consulta a Supabase y gestiona estados.
  private async loadCategories(): Promise<void> {
    // 9.1) Activamos indicador de carga y limpiamos error previo.
    this.loading = true;
    this.error = null;

    // 9.2) Llamamos al servicio: getCategories() hace la petición REST a PostgREST.
    const { data, error } = await this.supa.getCategories();

    // 9.3) Si hay error (RLS, red, estructura…), lo guardamos para mostrarlo en el HTML.
    if (error) {
      this.error = error.message ?? 'Error desconocido al cargar categorías';
      this.categories = [];
      this.loading = false;
      return;
    }

    // 9.4) Si todo ok, asignamos el array (o vacío por seguridad) y apagamos el loading.
    this.categories = data ?? [];
    this.loading = false;
  }

  // 10) trackBy para *ngFor → mejora el rendimiento evitando recrear nodos
  //     cuando Angular re-renderiza (usamos el slug como clave estable).
  trackBySlug(_index: number, cat: Category): string {
    return cat.slug;
  }
}
