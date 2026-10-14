import { Routes } from '@angular/router';
import { exigePermissao } from '../core/auth/auth-guard';
import { PAINEIS, Painel } from '../core/auth/permissoes';
import { pacientesRoutes } from './pacientes/pacientes.routes';
import { terapiasRoutes } from './terapias/terapias.routes';
import { RegistrarPresenca } from './terapias/registrar-presenca/registrar-presenca';
import { EmitirRecusa } from './documentos/emitir-recusa/emitir-recusa';

// Telas que todo painel monta; quem decide se aparecem/abrem são as permissões do usuário.
// Os caminhos são os mesmos de TELAS_COMUNS (core/layout/menus.ts).
export function telasComunsRoutes(painel: Painel): Routes {
  const base = PAINEIS[painel];
  const presenca = exigePermissao('VISUALIZAR_TERAPIAS');
  return [
    { path: 'pacientes', children: pacientesRoutes(`${base}/pacientes`) },
    { path: 'terapias', children: terapiasRoutes(`${base}/terapias`, 'Controle de Agendamentos') },
    {
      path: 'presenca',
      component: RegistrarPresenca,
      canActivate: presenca.canActivate,
      data: { ...presenca.data, modo: 'geral', rotaTerapias: `${base}/terapias` },
    },
    { path: 'recusa', component: EmitirRecusa, ...exigePermissao('EMITIR_RECUSA') },
  ];
}
