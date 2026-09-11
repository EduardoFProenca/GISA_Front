import { Component } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';

@Component({
  selector: 'app-dashboard',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Cadastrar Paciente', descricao: 'Novo registro no sistema', icone: '📝', rota: '/administrador/pacientes/novo' },
    { titulo: 'Cadastrar Profissional', descricao: 'Adicionar ao corpo clínico', icone: '👤', rota: '/administrador/profissionais/novo' },
    { titulo: 'Criação de Agenda', descricao: 'Configurar nova agenda', icone: '📅', rota: '/administrador/agenda-medico/nova' },
    { titulo: 'Gestão de Usuários', descricao: 'Ver todos os usuários', icone: '👥', rota: '/administrador/usuarios' },
  ];

  atividadesRecentes: Atividade[] = [
    { descricao: 'Novo paciente cadastrado', tempoAtras: '10 min atrás' },
    { descricao: 'Consulta agendada para Dr. Silva', tempoAtras: '23 min atrás' },
  ];
}