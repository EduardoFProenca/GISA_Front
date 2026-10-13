import { Routes } from '@angular/router';
import { exigePermissao } from '../../core/auth/auth-guard';
import { DashboardEspecialista } from './dashboard/dashboard';
import { EmitirReceita } from './emitir-receita/emitir-receita';
import { EmitirAtestado } from './emitir-atestado/emitir-atestado';

export const especialistaRoutes: Routes = [
  { path: '', component: DashboardEspecialista },
  { path: 'receita', component: EmitirReceita, ...exigePermissao('EMITIR_RECEITA') },
  { path: 'atestado', component: EmitirAtestado, ...exigePermissao('EMITIR_ATESTADO') },
];
