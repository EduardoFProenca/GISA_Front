import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ItemAgenda } from '../../../core/models/agenda-especialista.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { AgendaEspecialistaService } from '../../../core/services/agenda-especialista';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { Header } from '../../../shared/components/header/header';
import { PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { Auth } from '../../../core/auth/auth';
import { acoesRapidasDoPainel } from '../../../core/layout/menus';
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
  private auth = inject(Auth);
  private destroyRef = inject(DestroyRef);

  icones = ICONES;

  // Mesmo catálogo do menu lateral, filtrado pelas permissões (core/layout/menus.ts).
  acoesRapidas = acoesRapidasDoPainel('ESPECIALISTA', (f) => this.auth.temPermissao(f));

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
