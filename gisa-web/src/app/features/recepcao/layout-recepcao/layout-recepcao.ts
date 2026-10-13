import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ItemMenu, Menu } from '../../../shared/components/menu/menu';
import { ACOES_RAPIDAS_RECEPCIONISTA } from '../acoes-rapidas';

const ICONE_INICIO = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>`;

// Casca do portal da Recepção: menu lateral + a tela da rota.
// Itens: Início (dashboard) + as ações rápidas do dashboard.
@Component({
  selector: 'app-layout-recepcao',
  imports: [Menu, RouterOutlet],
  templateUrl: './layout-recepcao.html',
  styleUrl: './layout-recepcao.scss',
})
export class LayoutRecepcao {
  itensMenu: ItemMenu[] = [
    { label: 'Início', iconeSvg: ICONE_INICIO, rota: '/recepcao', exato: true },
    ...ACOES_RAPIDAS_RECEPCIONISTA.map((a) => ({
      label: a.titulo,
      iconeSvg: a.iconeSvg,
      rota: a.rota,
    })),
  ];
}