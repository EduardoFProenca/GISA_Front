import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Layout {
  // Começa fechado: só abre quando o usuário clica no ☰.
  menuAberto = signal(false);

  toggleMenu() {
    this.menuAberto.update(v => !v);
  }

  fecharMenu() {
    this.menuAberto.set(false);
  }
}