import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from './supabase.service';

// Bootstrap JS está cargado globalmente (angular.json -> scripts).
declare const bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  // Necesario para <a routerLink ... routerLinkActive ...> y <router-outlet>
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  currentYear = new Date().getFullYear();

  // Campos usados por el formulario de newsletter
  newsletterEmail = '';
  loading = false;

  constructor(private supabase: SupabaseService) {}

  // Menú hamburguesa: se cierra a los 3s
  autoCloseMenu(): void {
    setTimeout(() => {
      const navEl = document.getElementById('nav');
      if (!navEl || typeof bootstrap === 'undefined') return;
      const collapse = bootstrap.Collapse.getOrCreateInstance(navEl);
      collapse.hide();
    }, 3000);
  }

  // Enviar email a Supabase
  async onSubscribe() {
    const email = this.newsletterEmail.trim().toLowerCase();
    if (!email) return;

    this.loading = true;
    const { data, error } = await this.supabase.addSubscriber(email);
    this.loading = false;

    if (!error) {
      this.newsletterEmail = '';
      console.log('Suscripción guardada:', data);
      return;
    }

    // Duplicado (violación de UNIQUE)
    if ((error as any)?.code === '23505') {
      console.warn('Email ya suscrito');
      this.newsletterEmail = '';
      return;
    }

    console.error('Error al suscribir:', (error as any)?.message || error);
  }
}
