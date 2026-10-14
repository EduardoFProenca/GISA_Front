import { Routes } from '@angular/router';
import { AlterarSenha } from '../conta/alterar-senha/alterar-senha';
import { LayoutPainel } from '../../core/layout/layout-painel/layout-painel';
import { DashboardRecepcao } from './dashboard/dashboard';
import { telasComunsRoutes } from '../telas-comuns.routes';

// A Recepção não tem telas próprias: só as comuns que as permissões dela liberam.
export const recepcaoRoutes: Routes = [
  {
    path: '',
    component: LayoutPainel,
    data: { painel: 'RECEPCAO' },
    children: [
      { path: '', component: DashboardRecepcao },
      { path: 'minha-senha', component: AlterarSenha },
      ...telasComunsRoutes('RECEPCAO'),
    ],
  },
];
