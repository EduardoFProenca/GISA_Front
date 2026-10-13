import { Routes } from '@angular/router';
import { DashboardEspecialista } from './dashboard/dashboard';
import { EmitirReceita } from './emitir-receita/emitir-receita';
import { EmitirAtestado } from './emitir-atestado/emitir-atestado';

export const especialistaRoutes: Routes = [
  { path: '', component: DashboardEspecialista },
  { path: 'receita', component: EmitirReceita },
  { path: 'atestado', component: EmitirAtestado },
];
