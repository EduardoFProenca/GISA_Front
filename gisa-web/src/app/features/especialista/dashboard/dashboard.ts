import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ItemAgenda } from '../../../core/models/agenda-especialista.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { AgendaEspecialistaService } from '../../../core/services/agenda-especialista';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { Header } from '../../../shared/components/header/header';
import { AcaoRapida, PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { ICONES } from '../../../shared/icons';
import { hojeIso } from '../../../shared/utils/data.util';
import { ROTULO_MODALIDADE } from '../../../shared/utils/rotulos.util';
import { ROTULO_STATUS_AGENDA, proximoPaciente, resumoDoDia, statusAgenda } from '../agenda/agenda.util';

@Component({
  selector: 'app-dashboard-especialista',
  imports: [CardEstatistica, Header, PainelAcoesComponent, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardEspecialista implements OnInit {
  private agendaService = inject(AgendaEspecialistaService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Minha Agenda', descricao: 'Semana e atendimentos', icone: ICONES.calendario, rota: '/especialista/agenda' },
    { titulo: 'Minhas Terapias do Dia', descricao: 'Registrar presença', icone: ICONES.gestaoConsultas, rota: '/especialista/minhas-terapias' },
    { titulo: 'Todas as Terapias', descricao: 'Consultar e agendar', icone: ICONES.gestaoAtividades, rota: '/especialista/terapias' },
    { titulo: 'Emitir Atestado', descricao: 'Texto livre ou modelo', icone: ICONES.atestado, rota: '/especialista/atestado' },
    { titulo: 'Emitir Receita', descricao: 'Imprimir receita do paciente', icone: ICONES.receita, rota: '/especialista/receita' },
  ];

  readonly rotuloStatus = ROTULO_STATUS_AGENDA;
  readonly rotuloModalidade = ROTULO_MODALIDADE;
  readonly statusDe = statusAgenda;

  // "Agora" em signal para o card "Próximo Paciente" acompanhar o relógio sem recarregar a tela.
  private agora = signal(new Date());

  carregando = signal(true);
  aviso = signal('');
  doDia = signal<ItemAgenda[]>([]);
  resumo = computed(() => resumoDoDia(this.doDia()));
  proximo = computed(() => proximoPaciente(this.doDia(), this.agora()));

  constructor() {
    const relogio = setInterval(() => this.agora.set(new Date()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(relogio));
  }

  ngOnInit() {
    const hoje = hojeIso();
    this.agendaService.listarPeriodo(hoje, hoje).subscribe({
      next: (lista) => {
        this.doDia.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        // /terapias/minhas responde 400 se o usuário logado não for especialista
        this.aviso.set(mensagemDeErro(err, 'Não foi possível carregar a agenda de hoje.'));
      },
    });
  }

  abrirProntuario(idPaciente: number, idTerapia?: number) {
    this.router.navigate(['/especialista/atendimento', idPaciente], {
      queryParams: idTerapia ? { terapia: idTerapia } : {},
    });
  }
}
