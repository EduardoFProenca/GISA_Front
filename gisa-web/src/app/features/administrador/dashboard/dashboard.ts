import { Component } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { Menu } from '../../../shared/components/menu/menu';
import { ICONES } from '../../../shared/icons';



@Component({
  selector: 'app-dashboard-administrador',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header, Menu],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardAdministrador {
  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Cadastrar Paciente', descricao: 'Novo registro no sistema', iconeSvg: ICONES.cadastrarPaciente, rota: '/administrador/pacientes/novo' },
    { titulo: 'Cadastrar Profissional', descricao: 'Adicionar ao corpo clínico', iconeSvg: ICONES.cadastrarProfissional, rota: '/administrador/profissionais/novo' },
    { titulo: 'Criação de Agenda', descricao: 'Configurar nova agenda', iconeSvg: ICONES.criacaoAgenda, rota: '/administrador/agenda-medico/nova' },
    { titulo: 'Criar Consulta', descricao: 'Nova consulta no sistema', iconeSvg: ICONES.calendario, rota: '/administrador/consultas/nova' },
    { titulo: 'Gestão de Consultas', descricao: 'Visualizar e gerenciar', iconeSvg: ICONES.gestaoConsultas, rota: '/administrador/consultas' },
    { titulo: 'Gestão de Agenda', descricao: 'Visualizar e configurar', iconeSvg: ICONES.calendario, rota: '/administrador/agenda-medico' },
    { titulo: 'Gestão de Pacientes', descricao: 'Ver todos os pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/administrador/pacientes' },
    { titulo: 'Gestão de Profissionais', descricao: 'Ver corpo clínico', iconeSvg: ICONES.gestaoProfissionais, rota: '/administrador/profissionais/gerenciar' },
    { titulo: 'Controle de Agendamentos', descricao: 'Confirmar e remarcar', iconeSvg: ICONES.calendario, rota: '/administrador/agendamentos' },
  ]; // <--- Quebra de linha aqui melhora a leitura

  atividadesRecentes: Atividade[] = [
    { descricao: 'Novo paciente cadastrado', tempoAtras: '10 min atrás' },
    { descricao: 'Consulta agendada para Dr. Silva', tempoAtras: '23 min atrás' },
  ];
}