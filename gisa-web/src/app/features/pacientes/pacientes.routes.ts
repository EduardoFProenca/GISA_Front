import { Routes } from '@angular/router';
import { permissaoGuard } from '../../core/auth/auth-guard';
import { Funcionalidade } from '../../core/auth/permissoes';
import { GerenciarPacientes } from './gerenciar-pacientes/gerenciar-pacientes';
import { CadastrarPaciente } from './cadastrar-paciente/cadastrar-paciente';
import { DetalhePaciente } from './detalhe-paciente/detalhe-paciente';
import { EditarPaciente } from './editar-paciente/editar-paciente';

// Telas de pacientes, compartilhadas entre os painéis. Cada painel monta as rotas com a sua base:
//   { path: 'pacientes', children: pacientesRoutes('/recepcao/pacientes') }
export function pacientesRoutes(rotaBase: string): Routes {
  const rota = (funcionalidade: Funcionalidade) => ({
    canActivate: [permissaoGuard],
    data: { rotaBasePacientes: rotaBase, funcionalidades: [funcionalidade] },
  });

  return [
    { path: '', component: GerenciarPacientes, ...rota('VISUALIZAR_PACIENTES') },
    { path: 'novo', component: CadastrarPaciente, ...rota('CADASTRAR_PACIENTE') },
    { path: ':id/editar', component: EditarPaciente, ...rota('EDITAR_PACIENTE') },
    { path: ':id', component: DetalhePaciente, ...rota('VISUALIZAR_PACIENTES') },
  ];
}
