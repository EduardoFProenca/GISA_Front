import { Routes } from '@angular/router';
import { DashboardAdministrador } from './dashboard/dashboard';
import { CadastroProfissional } from './cadastrar-profissional/cadastrar-profissional';
import { GerenciarProfissionais } from './gerenciar-profissionais/gerenciar-profissionais';
import { DetalheProfissional } from './detalhe-profissional/detalhe-profissional';
import { EditarProfissional } from './editar-profissional/editar-profissional';
import { CriarConsulta } from './criar-consulta/criar-consulta';
import { HistoricoProfissional } from './historico-profissional/historico-profissional';
import { CadastrarPaciente } from './cadastrar-paciente/cadastrar-paciente';
import { GerenciarPacientes } from './gerenciar-pacientes/gerenciar-pacientes';
import { DetalhePaciente } from './detalhe-paciente/detalhe-paciente';
import { EditarPaciente } from './editar-paciente/editar-paciente';
import { GerenciarConsultas } from './gerenciar-consultas/gerenciar-consultas';



export const administradorRoutes: Routes = [
  { path: '', component: DashboardAdministrador },
  { path: 'profissionais/novo', component: CadastroProfissional },
  { path: 'profissionais/gerenciar', component: GerenciarProfissionais },
  { path: 'profissionais/:id', component: DetalheProfissional },
  { path: 'profissionais/:id/editar', component: EditarProfissional },
  { path: 'consultas/nova', component: CriarConsulta },
  { path: 'profissionais/:id/historico', component: HistoricoProfissional },

  // Rotas de Paciente
  { path: 'pacientes/novo', component: CadastrarPaciente },
  { path: 'pacientes/gerenciar', component: GerenciarPacientes },
  { path: 'pacientes/:id', component: DetalhePaciente },
  { path: 'pacientes/:id/editar', component: EditarPaciente },

  { path: 'consultas/gerenciar', component: GerenciarConsultas },
 
];