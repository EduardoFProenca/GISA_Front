import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { ItemMenu, Menu } from '../../../shared/components/menu/menu';
import { Auth } from '../../auth/auth';
import { PAINEIS, Painel } from '../../auth/permissoes';
import { itensDoMenu } from '../menus';

// Casca de todos os painéis: menu lateral (☰) + a tela da rota.
// No dashboard (Início) o menu não aparece: lá a navegação é pelo "Gestão Rápida".
// Uso nas rotas do painel: { path: '', component: LayoutPainel, data: { painel: 'RECEPCAO' }, children: [...] }
@Component({
  selector: 'app-layout-painel',
  imports: [Menu, RouterOutlet],
  templateUrl: './layout-painel.html',
  styleUrl: './layout-painel.scss',
})
export class LayoutPainel {
  private auth = inject(Auth);
  private router = inject(Router);
  private painel = inject(ActivatedRoute).snapshot.data['painel'] as Painel;

  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  // Caminho sem query string nem fragmento, comparado com a base do painel.
  naInicio = computed(() => this.url().split(/[?#]/)[0].replace(/\/$/, '') === PAINEIS[this.painel]);

  // Recalcula quando as permissões do usuário mudam (ex.: perfil alterado).
  itens = computed<ItemMenu[]>(() => {
    this.auth.permissoes();
    return itensDoMenu(this.painel, (f) => this.auth.temPermissao(f)).map((item, i) => ({ ...item, exato: i === 0 }));
  });
}
