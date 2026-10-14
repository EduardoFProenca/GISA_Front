import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, forkJoin, map, of, switchMap } from 'rxjs';
import { ItemAgenda } from '../../../core/models/agenda-especialista.model';
import { SolicitacaoRemarcacao, StatusRemarcacao } from '../../../core/models/remarcacao.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { AgendaEspecialistaService } from '../../../core/services/agenda-especialista';
import { MSG_RECURSO_PENDENTE, mensagemDeErroRecurso } from '../../../core/services/endpoint-pendente';
import { PacienteService } from '../../../core/services/paciente';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { Header } from '../../../shared/components/header/header';
import { AcaoRapida, PainelAcoesComponent } from '../../../shared/components/painel-acoes/painel-acoes';
import { ICONES } from '../../../shared/icons';
import { dataCurta, dataHoraLocal, hojeIso } from '../../../shared/utils/data.util';
import { formatarCpf } from '../../../shared/utils/formatacao.util';
import { ROTULO_MODALIDADE } from '../../../shared/utils/rotulos.util';
import { soDigitos } from '../../../shared/utils/texto.util';
import {
  ROTULO_STATUS_AGENDA,
  formatarMatricula,
  proximoPaciente,
  resumoDoDia,
  statusAgenda,
} from '../agenda/agenda.util';

const LIMITE_RESULTADOS_BUSCA = 6;

const ROTULO_SOLICITACAO: Record<StatusRemarcacao, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  RECUSADA: 'Recusada',
};

interface ResultadoBusca {
  idCadastro: number;
  nome: string;
  cpf: string;
}

@Component({
  selector: 'app-dashboard-especialista',
  imports: [CardEstatistica, Header, PainelAcoesComponent, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardEspecialista implements OnInit {
  private agendaService = inject(AgendaEspecialistaService);
  private pacienteService = inject(PacienteService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  icones = ICONES;

  acoesRapidas: AcaoRapida[] = [
    { titulo: 'Minha Agenda', descricao: 'Semana e atendimentos', icone: ICONES.calendario, rota: '/especialista/agenda' },
    { titulo: 'Minhas Terapias do Dia', descricao: 'Registrar presença', icone: ICONES.gestaoConsultas, rota: '/especialista/minhas-terapias' },
    { titulo: 'Todas as Terapias', descricao: 'Consultar e agendar', icone: ICONES.gestaoAtividades, rota: '/especialista/terapias' },
  ];

  readonly rotuloStatus = ROTULO_STATUS_AGENDA;
  readonly rotuloModalidade = ROTULO_MODALIDADE;
  readonly rotuloSolicitacao = ROTULO_SOLICITACAO;
  readonly statusDe = statusAgenda;
  readonly dataCurta = dataCurta;
  readonly dataHora = dataHoraLocal;
  readonly cpf = formatarCpf;
  readonly matricula = formatarMatricula;

  // "Agora" em signal para o card "Próximo Paciente" acompanhar o relógio sem recarregar a tela.
  private agora = signal(new Date());

  carregando = signal(true);
  aviso = signal('');
  doDia = signal<ItemAgenda[]>([]);
  resumo = computed(() => resumoDoDia(this.doDia()));
  proximo = computed(() => proximoPaciente(this.doDia(), this.agora()));

  // Notificações de remarcação
  solicitacoes = signal<SolicitacaoRemarcacao[]>([]);
  carregandoSolicitacoes = signal(true);
  erroSolicitacoes = signal('');
  avaliadas = computed(() => this.solicitacoes().filter((s) => s.status !== 'PENDENTE').length);

  // Busca rápida de assistidos
  termoBusca = signal('');
  resultados = signal<ResultadoBusca[]>([]);
  buscandoPacientes = signal(false);
  erroBusca = signal('');
  private busca$ = new Subject<string>();
  mostrarResultados = computed(() => this.termoBusca().trim().length >= 2);

  constructor() {
    const relogio = setInterval(() => this.agora.set(new Date()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(relogio));

    this.busca$
      .pipe(
        debounceTime(300),
        switchMap((termo) => {
          this.erroBusca.set('');
          if (termo.trim().length < 2) {
            this.buscandoPacientes.set(false);
            return of<ResultadoBusca[]>([]);
          }
          this.buscandoPacientes.set(true);
          return this.buscarPacientes(termo).pipe(
            catchError((err) => {
              this.erroBusca.set(mensagemDeErro(err, 'Não foi possível buscar pacientes.'));
              return of<ResultadoBusca[]>([]);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((lista) => {
        this.resultados.set(lista);
        this.buscandoPacientes.set(false);
      });
  }

  ngOnInit() {
    this.carregarAgenda();
    this.carregarSolicitacoes();
  }

  private carregarAgenda() {
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

  private carregarSolicitacoes() {
    this.agendaService.listarSolicitacoes().subscribe({
      next: (lista) => {
        this.solicitacoes.set(lista);
        this.carregandoSolicitacoes.set(false);
      },
      error: (err) => {
        this.carregandoSolicitacoes.set(false);
        this.erroSolicitacoes.set(mensagemDeErroRecurso(err, 'Não foi possível carregar as solicitações.'));
      },
    });
  }

  aoDigitarBusca(texto: string) {
    this.termoBusca.set(texto);
    this.busca$.next(texto);
  }

  // Nome e CPF filtram na API (GET /pacientes); número curto também é tentado como matrícula (idCadastro).
  private buscarPacientes(termo: string) {
    const digitos = soDigitos(termo);
    const consultas = [];

    if (/\D/.test(termo.replace(/[\s.\-/]/g, ''))) {
      consultas.push(
        this.pacienteService.listar({ nome: termo.trim(), size: LIMITE_RESULTADOS_BUSCA }).pipe(
          map((p) => p.content.map((r): ResultadoBusca => ({ idCadastro: r.idCadastro, nome: r.nome, cpf: r.cpf })))
        )
      );
    }
    if (digitos.length >= 3) {
      consultas.push(
        this.pacienteService.listar({ cpf: digitos, size: LIMITE_RESULTADOS_BUSCA }).pipe(
          map((p) => p.content.map((r): ResultadoBusca => ({ idCadastro: r.idCadastro, nome: r.nome, cpf: r.cpf })))
        )
      );
    }
    if (digitos.length > 0 && digitos.length <= 6) {
      consultas.push(
        this.pacienteService.buscar(Number(digitos)).pipe(
          map((p): ResultadoBusca[] => [{ idCadastro: p.pessoa.idCadastro, nome: p.pessoa.nome, cpf: p.pessoa.cpf }]),
          catchError(() => of<ResultadoBusca[]>([])) // matrícula que não existe
        )
      );
    }
    if (consultas.length === 0) return of<ResultadoBusca[]>([]);

    return forkJoin(consultas).pipe(
      map((listas) => {
        const vistos = new Map<number, ResultadoBusca>();
        for (const r of listas.flat()) vistos.set(r.idCadastro, r);
        return [...vistos.values()].slice(0, LIMITE_RESULTADOS_BUSCA);
      })
    );
  }

  abrirProntuario(idPaciente: number, idTerapia?: number) {
    this.router.navigate(['/especialista/atendimento', idPaciente], {
      queryParams: idTerapia ? { terapia: idTerapia } : {},
    });
  }

  readonly msgPendente = MSG_RECURSO_PENDENTE;
}
