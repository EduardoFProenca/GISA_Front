import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';

@Component({
  selector: 'app-dashboard-assistente-social',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardAssistenteSocial {
  private router = inject(Router);

  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Visualizar Dados de Saúde', descricao: 'Consultar histórico clínico', iconeSvg: ICONES.gestaoPacientes, rota: '/assistente-social/pacientes' },
    { titulo: 'Gerenciar Histórico', descricao: 'Situação socioeconômica', iconeSvg: ICONES.gestaoAtividades, rota: '/assistente-social/pacientes' },
  ];

  atividadesRecentes: Atividade[] = [
    {
      descricao: 'Histórico atualizado — família Silva',
      tempoAtras: '30 min atrás',
      acoes: [
        { label: 'Ver histórico', acao: () => this.verHistorico(1) },
      ]
    },
    {
      descricao: 'PTS revisado para Carlos Mendes',
      tempoAtras: '2 horas atrás',
      acoes: [
        { label: 'Ver PTS', acao: () => this.verPTS(2) },
      ]
    },
  ];

  itensMenu = [
    { label: 'Início', iconeSvg: ICONES.calendario, rota: '/assistente-social' },
    { label: 'Pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/assistente-social/pacientes' },
  ];

  // Abre o detalhe do paciente em modo leitura (o PTS ainda não tem tela própria no projeto).
  verHistorico(idPaciente: number) {
    this.router.navigate(['/assistente-social/pacientes', idPaciente]);
  }

  verPTS(idPaciente: number) {
    this.router.navigate(['/assistente-social/pacientes', idPaciente]);
  }
}