import { Component } from '@angular/core';
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
  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Visualizar Pacientes', descricao: 'Consultar dados de um paciente', iconeSvg: ICONES.gestaoPacientes, rota: '/assistente-social/pacientes' },
  ];

  // TODO: preencher com o histórico de atividades quando a API tiver o endpoint.
  atividadesRecentes: Atividade[] = [];
}