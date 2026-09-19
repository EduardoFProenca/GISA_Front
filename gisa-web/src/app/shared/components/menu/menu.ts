import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Layout } from '../../../core/layout/layout';

export interface ItemMenu {
  label: string;
  iconeSvg: string;
  rota: string;
}

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {
  @Input() itens: ItemMenu[] = [];
  @Input() nomeUsuario: string = '';

  layout = inject(Layout);

  constructor(private sanitizer: DomSanitizer) {}

  get menuFechado(): boolean {
    return !this.layout.menuAberto();
  }

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}