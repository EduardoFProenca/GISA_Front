import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Layout {
  menuAberto = signal(true);

  toggleMenu() {
    this.menuAberto.update(v => !v);
  }
}