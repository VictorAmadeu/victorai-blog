import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Bootstrap JS está cargado globalmente (angular.json -> scripts).
// Declaramos el tipo para usar su API sin errores de TypeScript.
declare const bootstrap: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  currentYear = new Date().getFullYear();

  // Al pulsar el botón hamburguesa, esperamos 3s y colapsamos el menú.
  autoCloseMenu(): void {
    setTimeout(() => {
      const navEl = document.getElementById('nav');
      if (!navEl || typeof bootstrap === 'undefined') return;
      const collapse = bootstrap.Collapse.getOrCreateInstance(navEl);
      collapse.hide();
    }, 3000);
  }
}
