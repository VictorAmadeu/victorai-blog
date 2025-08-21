// src/app/pages/home/home.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  newsletterEmail = '';
  loading = false;

  constructor(private supabase: SupabaseService) {}

  async onSubscribe() {
    const email = this.newsletterEmail.trim().toLowerCase();
    if (!email) return;

    this.loading = true;
    const { data, error, status } = await this.supabase.addSubscriber(
      email
    );
    this.loading = false;

    if (!error) {
      this.newsletterEmail = '';
      alert(`¡Gracias! Te has suscrito con: ${data?.email || email}`);
      return;
    }

    // Duplicado (violación UNIQUE)
    if (error?.code === '23505' || /duplicate|unique/i.test(error?.message || '')) {
      this.newsletterEmail = '';
      alert('Ese correo ya está suscrito ✅');
      return;
    }

    console.error('Error al suscribir:', { error, status });
    alert(
      `No se pudo suscribir: ${error?.message || 'Error desconocido'}${
        status ? ' (HTTP ' + status + ')' : ''
      }`
    );
  }
}
