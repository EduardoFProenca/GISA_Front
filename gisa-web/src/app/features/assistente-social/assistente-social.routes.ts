import { Routes } from '@angular/router';
import { AlterarSenha } from '../conta/alterar-senha/alterar-senha';
import { LayoutPainel } from '../../core/layout/layout-painel/layout-painel';
import { DashboardAssistenteSocial } from './dashboard/dashboard';
import { telasComunsRoutes } from '../telas-comuns.routes';

// O Assistente Social não tem telas próprias: só as comuns que as permissões dele liberam.
const telas: Routes = [
  { path: '', component: DashboardAssistenteSocial },
  { path: 'minha-senha', component: AlterarSenha },
  ...telasComunsRoutes('ASSISTENTE_SOCIAL'),
];

// Todas as telas do painel ficam dentro do layout com o menu lateral.
export const assistenteSocialRoutes: Routes = [
  { path: '', component: LayoutPainel, data: { painel: 'ASSISTENTE_SOCIAL' }, children: telas },
];
