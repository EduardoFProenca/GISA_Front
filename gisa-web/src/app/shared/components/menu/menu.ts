import { Component, HostListener, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Auth } from '../../../core/auth/auth';
import { Layout } from '../../../core/layout/layout';

export interface ItemMenu {
  label: string;
  iconeSvg: string;
  rota: string;
  // true = só fica destacado na rota exata (use no item "Início").
  exato?: boolean;
  // Título da seção; aparece antes do primeiro item de cada grupo.
  grupo?: string;
}

const LARGURA_CELULAR_PX = 768;

// Menu lateral. Abre/fecha pelo Layout (botão ☰ do cabeçalho).
// No celular vira gaveta sobre o conteúdo, com fundo escurecido.
@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {
  @Input() itens: ItemMenu[] = [];
  // Usado quando não há usuário logado com nome conhecido.
  @Input() nomeUsuario: string = '';

  layout = inject(Layout);
  private auth = inject(Auth);

  constructor(private sanitizer: DomSanitizer) {}

  get menuFechado(): boolean {
    return !this.layout.menuAberto();
  }

  get nome(): string {
    return this.auth.usuarioAtual()?.nome || this.nomeUsuario;
  }

  iniciaGrupo(indice: number): boolean {
    const grupo = this.itens[indice].grupo;
    return !!grupo && grupo !== this.itens[indice - 1]?.grupo;
  }

  sanitizarIcone(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  fechar() {
    this.layout.fecharMenu();
  }

  // No celular o menu cobre a tela, então fecha ao escolher um item.
  aoNavegar() {
    if (typeof window !== 'undefined' && window.innerWidth <= LARGURA_CELULAR_PX) {
      this.fechar();
    }
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc() {
    if (!this.menuFechado) this.fechar();
  }
}