// src/app/pages/home/home.component.ts — Componente Standalone de la Home

// Component: define el componente; no usamos NgModule (Standalone).
import { Component } from '@angular/core';

// RouterLink: habilita el uso de [routerLink] en la plantilla (botones/enlaces).
import { RouterLink } from '@angular/router';

// FormsModule: necesario para usar ngForm y [(ngModel)] en el formulario del boletín.
import { FormsModule } from '@angular/forms';

// Servicio propio para gestionar la suscripción en Supabase (insert en la tabla newsletter_subscribers).
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-home', // Selector del componente (no imprescindible si solo se enruta).
  standalone: true, // ✅ Standalone: sin NgModule.
  imports: [
    RouterLink, // Para usar routerLink en los <a> de la Home.
    FormsModule, // Para ngForm y [(ngModel)] del newsletter.
  ],
  templateUrl: './home.component.html', // Plantilla HTML asociada.
  styleUrl: './home.component.scss', // Hoja de estilos específica del componente.
})
export class HomeComponent {
  // ====== Estado de la vista ======
  newsletterEmail = ''; // Modelo enlazado al input del newsletter.
  loading = false; // Estado de carga mientras enviamos la suscripción.

  // Inyectamos el servicio de Supabase vía constructor.
  constructor(private supabase: SupabaseService) {}

  // Handler del submit del formulario de newsletter.
  async onSubscribe() {
    // Normalizamos el email (trim + lower).
    const email = this.newsletterEmail.trim().toLowerCase();
    if (!email) return; // Si está vacío, no hacemos nada.

    this.loading = true;

    // Llamamos a SupabaseService para insertar el email en la tabla.
    const { data, error, status } = await this.supabase.addSubscriber(email);

    this.loading = false;

    // Si todo OK: limpiamos el campo y avisamos al usuario.
    if (!error) {
      this.newsletterEmail = '';
      alert(`¡Gracias! Te has suscrito con: ${data?.email || email}`);
      return;
    }

    // Si el email ya existe (violación de UNIQUE), mostramos un mensaje amistoso.
    if (
      error?.code === '23505' ||
      /duplicate|unique/i.test(error?.message || '')
    ) {
      this.newsletterEmail = '';
      alert('Ese correo ya está suscrito ✅');
      return;
    }

    // Cualquier otro error: log técnico + aviso al usuario con información útil.
    console.error('Error al suscribir:', { error, status });
    alert(
      `No se pudo suscribir: ${error?.message || 'Error desconocido'}${
        status ? ' (HTTP ' + status + ')' : ''
      }`
    );
  }
}
