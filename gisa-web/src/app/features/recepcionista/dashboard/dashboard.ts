import { Component } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';
import { ACOES_RAPIDAS_RECEPCIONISTA } from '../acoes-rapidas';

@Component({
  selector: 'app-dashboard-recepcionista',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardRecepcionista {
  icones = ICONES;

  acoesRapidas = ACOES_RAPIDAS_RECEPCIONISTA;

  atividadesRecentes: Atividade[] = [
    {
      descricao: 'Paciente Maria Costa registrado',
      tempoAtras: '5 min atrás',
      acoes: [
        { label: 'Ver cadastro', acao: () => this.verCadastro('maria-costa') },
      ]
    },
    {
      descricao: 'Presença confirmada — consulta 14h',
      tempoAtras: '22 min atrás',
    },
    {
      descricao: 'Recusa emitida para Pedro Alves',
      tempoAtras: '1 hora atrás',
      acoes: [
        { label: 'Ver documento', acao: () => this.verRecusa('pedro-alves') },
      ]
    },
  ];

  verCadastro(id: string) {
    console.log('ver cadastro de', id);
  }

  verRecusa(id: string) {
    console.log('ver recusa de', id);
  }
}