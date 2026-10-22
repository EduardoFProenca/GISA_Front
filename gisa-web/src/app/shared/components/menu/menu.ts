import { Component, HostListener, inject, Input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/auth/auth';
import { Layout } from '../../../core/layout/layout';

export interface ItemMenu {
  label: string;
  icone: string;
  rota: string;
  // true = só fica destacado na rota exata (use no item "Início").
  exato?: boolean;
  // Título da seção; aparece antes do primeiro item de cada grupo.
  grupo?: string;
}

// Menu lateral. Abre/fecha pelo Layout (botão ☰ do cabeçalho).
// No celular vira gaveta sobre o conteúdo, com fundo escurecido.
@Component({
  selector: 'app-menu',
  imports: [NgIcon, RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {
  @Input() itens: ItemMenu[] = [];
  // Usado quando não há usuário logado com nome conhecido.
  @Input() nomeUsuario: string = '';

  layout = inject(Layout);
  private auth = inject(Auth);


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

  fechar() {
    this.layout.fecharMenu();
  }

  // Fecha ao escolher um item, mesmo o da tela atual (que não gera navegação; as demais
  // trocas de tela já fecham o menu pelo Layout).
  aoNavegar() {
    this.fechar();
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc() {
    if (!this.menuFechado) this.fechar();
  }
}