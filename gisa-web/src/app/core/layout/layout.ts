import { Injectable, signal } from '@angular/core';

const LARGURA_CELULAR_PX = 768;

@Injectable({ providedIn: 'root' })
export class Layout {
  // Aberto no computador, fechado no celular (onde o menu cobre a tela).
  menuAberto = signal(
    typeof window === 'undefined' || window.innerWidth > LARGURA_CELULAR_PX
  );

  toggleMenu() {
    this.menuAberto.update(v => !v);
  }

  fecharMenu() {
    this.menuAberto.set(false);
  }
}