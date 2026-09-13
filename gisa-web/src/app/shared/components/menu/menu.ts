import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(private sanitizer: DomSanitizer) {}

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}