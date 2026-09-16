import { Component } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { Menu } from '../../../shared/components/menu/menu';
import { ICONES } from '../../../shared/icons';

@Component({
  selector: 'app-dashboard-recepcionista',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardRecepcionista {
  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Gerenciar Paciente', descricao: 'Registro e triagem', iconeSvg: ICONES.gestaoPacientes, rota: '/recepcionista/pacientes' },
    { titulo: 'Emitir Recusa', descricao: 'Documento de recusa', iconeSvg: ICONES.cadastrarPaciente, rota: '/recepcionista/recusa' },
    { titulo: 'Registrar Presença', descricao: 'Presença ou ausência', iconeSvg: ICONES.gestaoConsultas, rota: '/recepcionista/presenca' },
  ];

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

  itensMenu = [
    { label: 'Início', iconeSvg: ICONES.calendario, rota: '/recepcionista' },
    { label: 'Pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/recepcionista/pacientes' },
    { label: 'Recusas', iconeSvg: ICONES.cadastrarPaciente, rota: '/recepcionista/recusa' },
    { label: 'Presenças', iconeSvg: ICONES.gestaoConsultas, rota: '/recepcionista/presenca' },
  ];

  verCadastro(id: string) {
    console.log('ver cadastro de', id);
  }

  verRecusa(id: string) {
    console.log('ver recusa de', id);
  }
}