// src/app/ui/scroll-top/scroll-top.component.spec.ts
// Pruebas del botón flotante "Volver arriba"

// 1) Utilidades de test de Angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

// 2) ✅ Importa el nombre REAL exportado por el componente
//    (en tu .ts el class name es UiScrollTopComponent)
import { UiScrollTopComponent } from './scroll-top.component';

describe('UiScrollTopComponent', () => {
  // 3) Tipamos con el componente correcto
  let component: UiScrollTopComponent;
  let fixture: ComponentFixture<UiScrollTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // 4) El componente es standalone, así que va en "imports"
      imports: [UiScrollTopComponent],
    }).compileComponents();

    // 5) Creamos la instancia a testear
    fixture = TestBed.createComponent(UiScrollTopComponent);
    component = fixture.componentInstance;

    // 6) Disparamos la 1ª detección de cambios
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // (Opcional) Ejemplo de prueba de la visibilidad según el scroll:
  it('should become visible when window.scrollY > 300', () => {
    // Simulamos que el usuario ha hecho scroll
    spyOnProperty(window, 'scrollY', 'get').and.returnValue(400);
    // Llamamos al handler que el componente escucha con @HostListener
    component.onScroll();
    expect(component.visible).toBeTrue();
  });
});
