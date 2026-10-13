import { Routes } from '@angular/router';
import { exigePermissao } from '../../core/auth/auth-guard';
import { DashboardEspecialista } from './dashboard/dashboard';
import { EmitirReceita } from './emitir-receita/emitir-receita';
import { EmitirAtestado } from './emitir-atestado/emitir-atestado';
import { RegistrarPresenca } from '../terapias/registrar-presenca/registrar-presenca';
import { terapiasRoutes } from '../terapias/terapias.routes';

const minhas = exigePermissao('VISUALIZAR_TERAPIAS');

export const especialistaRoutes: Routes = [
  { path: '', component: DashboardEspecialista },
  {
    path: 'minhas-terapias',
    component: RegistrarPresenca,
    canActivate: minhas.canActivate,
    data: { ...minhas.data, modo: 'minhas', rotaTerapias: '/especialista/terapias' },
  },
  { path: 'terapias', children: terapiasRoutes('/especialista/terapias', 'Terapias') },
  { path: 'receita', component: EmitirReceita, ...exigePermissao('EMITIR_RECEITA') },
  { path: 'atestado', component: EmitirAtestado, ...exigePermissao('EMITIR_ATESTADO') },
];
