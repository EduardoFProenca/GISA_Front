import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { ItemMenu, Menu } from '../../../shared/components/menu/menu';
import { Auth } from '../../auth/auth';
import { ROTA_INICIO } from '../../auth/permissoes';
import { itensDoMenu } from '../menus';

// Casca de todas as telas logadas: menu lateral (☰) + a tela da rota. O menu mostra só o que as
// permissões do usuário liberam (core/layout/menus.ts), qualquer que seja o nome do perfil.
// No Início o menu não aparece: lá a navegação é pelo "Gestão Rápida".
@Component({
  selector: 'app-layout-sistema',
  imports: [Menu, RouterOutlet],
  templateUrl: './layout-sistema.html',
  styleUrl: './layout-sistema.scss',
})
export class LayoutSistema {
  private auth = inject(Auth);
  private router = inject(Router);

  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  // Caminho sem query string nem fragmento.
  naInicio = computed(() => this.url().split(/[?#]/)[0].replace(/\/$/, '') === ROTA_INICIO);

  // Recalcula quando o usuário (e as permissões dele) mudam (ex.: perfil alterado).
  itens = computed<ItemMenu[]>(() => {
    this.auth.usuarioAtual();
    return itensDoMenu({
      pode: (f) => this.auth.temPermissao(f),
      temCadastro: (c) => this.auth.temCadastro(c),
    }).map((item, i) => ({ ...item, exato: i === 0 }));
  });
}
