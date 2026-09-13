import { Component } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { Menu } from '../../../shared/components/menu/menu';
import { ICONES } from '../../../shared/icons';

@Component({
  selector: 'app-dashboard-medico',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header, Menu],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardMedico {
  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Gerenciar Atendimento', descricao: 'Dados de saúde do paciente', iconeSvg: ICONES.gestaoPacientes, rota: '/medico/atendimento' },
    { titulo: 'Emitir Receita', descricao: 'Nova receita médica', iconeSvg: ICONES.gestaoAtividades, rota: '/medico/receita' },
    { titulo: 'Emitir Atestado', descricao: 'Novo atestado', iconeSvg: ICONES.cadastrarPaciente, rota: '/medico/atestado' },
  ];

  atividadesRecentes: Atividade[] = [
    {
      descricao: 'Consulta com Ana Souza concluída',
      tempoAtras: '15 min atrás',
      acoes: [
        { label: 'Ver detalhes', acao: () => this.verDetalhes('ana-souza') },
        { label: 'Cancelar', acao: () => this.cancelarConsulta('ana-souza') },
      ]
    },
    {
      descricao: 'Receita emitida para João Pedro',
      tempoAtras: '40 min atrás',
      acoes: [
        { label: 'Reenviar', acao: () => this.reenviarReceita('joao-pedro') },
        { label: 'Ver receita', acao: () => this.verReceita('joao-pedro') },
      ]
    },
    {
      descricao: 'Atestado emitido',
      tempoAtras: '2 horas atrás',
    },
  ];




  
  // --- já que não tem backend ainda ---

  verDetalhes(id: string) {
    console.log('ver detalhes de', id);
  }

  cancelarConsulta(id: string) {
    console.log('cancelar consulta de', id);
  }

  reenviarReceita(id: string) {
    console.log('reenviar receita para', id);
  }

  verReceita(id: string) {
    console.log('ver receita de', id);
  }
  //============================================
}