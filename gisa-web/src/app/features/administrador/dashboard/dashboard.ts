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
    { titulo: 'Cadastrar Paciente', descricao: 'Novo registro no sistema', iconeSvg: ICONES.cadastrarPaciente, rota: '/administrador/pacientes/novo' },
    { titulo: 'Nova Terapia', descricao: 'Agendar terapia', iconeSvg: ICONES.calendario, rota: '/administrador/terapias/nova' },
    { titulo: 'Gestão de Pacientes', descricao: 'Ver todos os pacientes', iconeSvg: ICONES.gestaoPacientes, rota: '/administrador/pacientes' },
    { titulo: 'Cadastrar Profissional', descricao: 'Adicionar ao corpo clínico', iconeSvg: ICONES.cadastrarProfissional, rota: '/administrador/profissionais/novo' },
    { titulo: 'Gestão de Terapias', descricao: 'Visualizar e gerenciar', iconeSvg: ICONES.gestaoConsultas, rota: '/administrador/terapias' },
    { titulo: 'Gestão de Profissionais', descricao: 'Ver corpo clínico', iconeSvg: ICONES.gestaoProfissionais, rota: '/administrador/profissionais/gerenciar' },
    { titulo: 'Cargos', descricao: 'Funções internas', iconeSvg: ICONES.gestaoAtividades, rota: '/administrador/cargos' },
    { titulo: 'CBOs', descricao: 'Classificação de ocupações', iconeSvg: ICONES.filtro, rota: '/administrador/cbos' },
    { titulo: 'Perfis de Acesso', descricao: 'Permissões dos usuários', iconeSvg: ICONES.pessoa, rota: '/administrador/perfis' },
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