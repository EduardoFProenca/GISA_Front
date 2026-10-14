import { Component, OnInit, inject, signal } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { AtividadesRecentes, Atividade } from '../../../shared/components/atividades-recentes/atividades-recentes';
import { Header } from '../../../shared/components/header/header';
import { ICONES } from '../../../shared/icons';
import { PacienteService } from '../../../core/services/paciente';
import { ProfissionalService } from '../../../core/services/profissional';
import { TerapiaService } from '../../../core/services/terapia';
import { Router } from '@angular/router';
import { terapiasDeHoje } from '../../terapias/terapias-hoje';

@Component({
  selector: 'app-dashboard-administrador',
  imports: [CardEstatistica, PainelAcoesComponent, AtividadesRecentes, Header],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardAdministrador implements OnInit {
  private pacienteService = inject(PacienteService);
  private profissionalService = inject(ProfissionalService);
  private terapiaService = inject(TerapiaService);
  private router = inject(Router);

  icones = ICONES;

  // '—' enquanto carrega ou se a chamada falhar.
  totalPacientes = signal<number | string>('—');
  totalProfissionais = signal<number | string>('—');
  profissionaisAtivos = signal<number | string>('—');

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Cadastrar Paciente', descricao: 'Novo registro no sistema', icone: ICONES.cadastrarPaciente, rota: '/administrador/pacientes/novo' },
    { titulo: 'Nova Terapia', descricao: 'Agendar terapia', icone: ICONES.calendario, rota: '/administrador/terapias/nova' },
    { titulo: 'Gestão de Pacientes', descricao: 'Ver todos os pacientes', icone: ICONES.gestaoPacientes, rota: '/administrador/pacientes' },
    { titulo: 'Cadastrar Profissional', descricao: 'Adicionar ao corpo clínico', icone: ICONES.cadastrarProfissional, rota: '/administrador/profissionais/novo' },
    { titulo: 'Gestão de Terapias', descricao: 'Visualizar e gerenciar', icone: ICONES.gestaoConsultas, rota: '/administrador/terapias' },
    { titulo: 'Gestão de Profissionais', descricao: 'Ver corpo clínico', icone: ICONES.gestaoProfissionais, rota: '/administrador/profissionais/gerenciar' },
    { titulo: 'Cargos', descricao: 'Funções internas', icone: ICONES.cargo, rota: '/administrador/cargos' },
    { titulo: 'CBOs', descricao: 'Classificação de ocupações', icone: ICONES.lista, rota: '/administrador/cbos' },
    { titulo: 'Perfis de Acesso', descricao: 'Permissões dos usuários', icone: ICONES.chave, rota: '/administrador/perfis' },
    { titulo: 'Emitir Recusa', descricao: 'Declaração de recusa de atendimento', icone: ICONES.recusa, rota: '/administrador/recusa' },
  ];

  terapiasHoje = signal<Atividade[]>([]);

  ngOnInit() {
    terapiasDeHoje(this.terapiaService, (t) => this.router.navigate(['/administrador/terapias', t.idTerapia])).subscribe({
      next: ({ atividades }) => this.terapiasHoje.set(atividades),
    });

    // size=1: só o total interessa, não a lista.
    this.pacienteService.listar({ page: 0, size: 1 }).subscribe({
      next: (pagina) => this.totalPacientes.set(pagina.totalElements),
    });

    this.profissionalService.listar({ size: 1 }).subscribe({
      next: (pagina) => this.totalProfissionais.set(pagina.totalElements),
    });
    this.profissionalService.listar({ size: 1, statusCadastro: 'ATIVO' }).subscribe({
      next: (pagina) => this.profissionaisAtivos.set(pagina.totalElements),
    });
  }
}