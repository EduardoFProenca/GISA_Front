import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ItemMenu, Menu } from '../../../shared/components/menu/menu';
import { Auth } from '../../auth/auth';
import { Painel } from '../../auth/permissoes';
import { itensDoMenu } from '../menus';

// Casca de todos os painéis: menu lateral (☰) + a tela da rota.
// Uso nas rotas do painel: { path: '', component: LayoutPainel, data: { painel: 'RECEPCAO' }, children: [...] }
@Component({
  selector: 'app-layout-painel',
  imports: [Menu, RouterOutlet],
  templateUrl: './layout-painel.html',
  styleUrl: './layout-painel.scss',
})
export class LayoutPainel {
  private auth = inject(Auth);
  private painel = inject(ActivatedRoute).snapshot.data['painel'] as Painel;

  // Recalcula quando as permissões do usuário mudam (ex.: perfil alterado).
  itens = computed<ItemMenu[]>(() => {
    this.auth.permissoes();
    return itensDoMenu(this.painel, (f) => this.auth.temPermissao(f)).map((item, i) => ({ ...item, exato: i === 0 }));
  });
}
