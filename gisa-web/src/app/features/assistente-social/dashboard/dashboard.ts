import { Component } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { Menu } from '../../../shared/components/menu/menu';
import { ICONES } from '../../../shared/icons';

@Component({
  selector: 'app-dashboard-assistente-social',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header, Menu],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardAssistenteSocial {
  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Visualizar Dados de Saúde', descricao: 'Consultar histórico clínico', iconeSvg: ICONES.gestaoPacientes, rota: '/assistente-social/dados-saude' },
    { titulo: 'Gerenciar Histórico', descricao: 'Situação socioeconômica', iconeSvg: ICONES.gestaoAtividades, rota: '/assistente-social/historico' },
  ];

  atividadesRecentes: Atividade[] = [
    {
      descricao: 'Histórico atualizado — família Silva',
      tempoAtras: '30 min atrás',
      acoes: [
        { label: 'Ver histórico', acao: () => this.verHistorico('familia-silva') },
      ]
    },
    {
      descricao: 'PTS revisado para Carlos Mendes',
      tempoAtras: '2 horas atrás',
      acoes: [
        { label: 'Ver PTS', acao: () => this.verPTS('carlos-mendes') },
      ]
    },
  ];

  itensMenu = [
    { label: 'Início', iconeSvg: ICONES.calendario, rota: '/assistente-social' },
    { label: 'Dados de Saúde', iconeSvg: ICONES.gestaoPacientes, rota: '/assistente-social/dados-saude' },
    { label: 'Histórico Social', iconeSvg: ICONES.gestaoAtividades, rota: '/assistente-social/historico' },
  ];

  verHistorico(id: string) {
    console.log('ver histórico de', id);
  }

  verPTS(id: string) {
    console.log('ver PTS de', id);
  }
}