import { Routes } from '@angular/router';
import { permissaoGuard } from '../../core/auth/auth-guard';
import { Funcionalidade } from '../../core/auth/permissoes';
import { GerenciarTerapias } from './gerenciar-terapias/gerenciar-terapias';
import { FormTerapia } from './form-terapia/form-terapia';
import { DetalheTerapia } from './detalhe-terapia/detalhe-terapia';

// Telas de terapia. Montadas em features/telas.routes.ts:
//   { path: 'terapias', children: terapiasRoutes('/terapias', 'Controle de Agendamentos') }
export function terapiasRoutes(rotaBase: string, titulo = 'Gestão de Terapias'): Routes {
  const rota = (funcionalidade: Funcionalidade) => ({
    canActivate: [permissaoGuard],
    data: { rotaBaseTerapias: rotaBase, tituloTerapias: titulo, funcionalidades: [funcionalidade] },
  });

  return [
    { path: '', component: GerenciarTerapias, ...rota('VISUALIZAR_TERAPIAS') },
    { path: 'nova', component: FormTerapia, ...rota('AGENDAR_TERAPIA') },
    { path: ':id/editar', component: FormTerapia, ...rota('EDITAR_TERAPIA') },
    { path: ':id', component: DetalheTerapia, ...rota('VISUALIZAR_TERAPIAS') },
  ];
}
