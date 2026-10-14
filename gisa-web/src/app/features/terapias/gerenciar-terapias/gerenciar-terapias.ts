import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { FiltroAvancado, EstadoFiltroAvancado, OpcaoFiltroAvancado } from '../../../shared/components/filtro-avancado/filtro-avancado';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { FormDialog } from '../../../shared/components/form-dialog/form-dialog';
import { SelectBusca, OpcaoSelectBusca } from '../../../shared/components/select-busca/select-busca';
import { ICONES } from '../../../shared/icons';
import { paraIso } from '../../../shared/utils/data.util';
import { COR_STATUS_TERAPIA, ROTULO_STATUS_TERAPIA } from '../../../shared/utils/rotulos.util';
import { FiltroTerapias, StatusTerapia, Terapia } from '../../../core/models/terapia.model';
import { TerapiaService } from '../../../core/services/terapia';
import { PacienteService } from '../../../core/services/paciente';
import { ProfissionalService } from '../../../core/services/profissional';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { CardTerapia } from '../componentes/card-terapia/card-terapia';
import { lerContextoTerapias } from '../contexto-terapias';

const STATUS: StatusTerapia[] = ['AGENDADA', 'EM_ATENDIMENTO', 'CONCLUIDA', 'CANCELADA'];

// Período escolhido no filtro -> data única ou intervalo (yyyy-MM-dd) da API.
function periodoParaFiltro(estado: EstadoFiltroAvancado | null): Pick<FiltroTerapias, 'data' | 'inicio' | 'fim'> {
  if (!estado) return {};
  const hoje = new Date();
  const dia = (deslocamento: number) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() + deslocamento);
    return paraIso(d);
  };
  switch (estado.periodo) {
    case 'hoje':
      return { data: dia(0) };
    case 'ontem':
      return { data: dia(-1) };
    case 'amanha':
      return { data: dia(1) };
    case 'mes':
      return {
        inicio: paraIso(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
        fim: paraIso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
      };
    case 'manual':
      // A API aceita só um dos lados (ex.: só início = daquele dia em diante).
      return { inicio: estado.dataInicio || undefined, fim: estado.dataFim || undefined };
    default:
      return {};
  }
}

@Component({
  selector: 'app-gerenciar-terapias',
  imports: [FormsModule, CardEstatistica, FiltroAvancado, CardTerapia, CabecalhoPagina, Paginacao, FormDialog, SelectBusca],
  templateUrl: './gerenciar-terapias.html',
  styleUrl: './gerenciar-terapias.scss',
})
export class GerenciarTerapias implements OnInit {
  private terapiaService = inject(TerapiaService);
  private pacienteService = inject(PacienteService);
  private profissionalService = inject(ProfissionalService);
  private auth = inject(Auth);
  private router = inject(Router);
  private contexto = lerContextoTerapias(inject(ActivatedRoute));

  icones = ICONES;
  titulo = this.contexto.titulo;
  rotaBase = this.contexto.rotaBase;
  podeAgendar = this.auth.temPermissao('AGENDAR_TERAPIA');
  podeEditar = this.auth.temPermissao('EDITAR_TERAPIA');
  podeCancelar = this.auth.temPermissao('ALTERAR_STATUS_TERAPIA');

  statusDisponiveis: OpcaoFiltroAvancado[] = STATUS.map((s) => ({
    valor: s,
    label: ROTULO_STATUS_TERAPIA[s],
    cor: COR_STATUS_TERAPIA[s],
  }));

  periodosDisponiveis: OpcaoFiltroAvancado[] = [
    { valor: 'hoje', label: 'Hoje' },
    { valor: 'ontem', label: 'Ontem' },
    { valor: 'amanha', label: 'Amanhã' },
    { valor: 'mes', label: 'Mês' },
    { valor: 'manual', label: 'Selecionar datas' },
  ];

  // Filtros
  opcoesPacientes = signal<OpcaoSelectBusca[]>([]);
  opcoesEspecialistas = signal<OpcaoSelectBusca[]>([]);
  idPaciente = signal<number | null>(null);
  idEspecialista = signal<number | null>(null);
  private filtroAvancado = signal<EstadoFiltroAvancado | null>(null);

  // Lista
  carregando = signal(true);
  erro = signal('');
  terapias = signal<Terapia[]>([]);
  totalElementos = signal(0);
  paginaAtual = signal(1);
  itensPorPagina = 9;

  // Contadores (mesmos filtros de período e pessoa, um status cada)
  contadores = signal<Partial<Record<StatusTerapia, number>>>({});

  // Cancelamento
  terapiaParaCancelar = signal<Terapia | null>(null);
  motivo = '';
  cancelando = signal(false);
  erroCancelamento = signal('');

  descricaoCancelamento = computed(() => {
    const t = this.terapiaParaCancelar();
    return t ? `${t.titulo} · ${t.data.split('-').reverse().join('/')} · ${t.horaInicio}–${t.horaTermino}` : '';
  });

  ngOnInit() {
    this.pacienteService.listar({ size: 1000 }).subscribe({
      next: (p) => this.opcoesPacientes.set(p.content.map((x) => ({ id: x.idCadastro, label: x.nome }))),
    });
    this.profissionalService.listarEspecialistas().subscribe({
      next: (lista) => this.opcoesEspecialistas.set(lista.map((x) => ({ id: x.idProfissional, label: x.nome }))),
    });
    this.carregar();
  }

  // Filtros comuns à lista e aos contadores (sem status e paginação).
  private filtroBase(): FiltroTerapias {
    return {
      ...periodoParaFiltro(this.filtroAvancado()),
      idPaciente: this.idPaciente() ?? undefined,
      idEspecialista: this.idEspecialista() ?? undefined,
    };
  }

  private carregar() {
    this.carregando.set(true);
    this.erro.set('');

    const base = this.filtroBase();
    const status = [...(this.filtroAvancado()?.status ?? [])] as StatusTerapia[];

    this.terapiaService
      .listar({ ...base, status, page: this.paginaAtual() - 1, size: this.itensPorPagina, sort: 'dataHoraInicio,desc' })
      .subscribe({
        next: (p) => {
          this.terapias.set(p.content);
          this.totalElementos.set(p.totalElements);
          this.carregando.set(false);
        },
        error: (err) => {
          this.carregando.set(false);
          this.erro.set(mensagemDeErro(err, 'Não foi possível carregar as terapias.'));
        },
      });

    // size=1: só o total de cada status interessa.
    forkJoin(
      Object.fromEntries(STATUS.map((s) => [s, this.terapiaService.listar({ ...base, status: [s], size: 1 })]))
    ).subscribe({
      next: (porStatus) =>
        this.contadores.set(Object.fromEntries(Object.entries(porStatus).map(([s, p]) => [s, p.totalElements]))),
    });
  }

  aplicarFiltroAvancado(estado: EstadoFiltroAvancado) {
    this.filtroAvancado.set(estado);
    this.paginaAtual.set(1);
    this.carregar();
  }

  filtrarPaciente(id: number | string | null) {
    this.idPaciente.set(id as number | null);
    this.paginaAtual.set(1);
    this.carregar();
  }

  filtrarEspecialista(id: number | string | null) {
    this.idEspecialista.set(id as number | null);
    this.paginaAtual.set(1);
    this.carregar();
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  // --- Ações do card ---

  verDetalhes(id: number) {
    this.router.navigate([this.rotaBase, id]);
  }

  editar(id: number) {
    this.router.navigate([this.rotaBase, id, 'editar']);
  }

  pedirCancelamento(id: number) {
    this.motivo = '';
    this.erroCancelamento.set('');
    this.terapiaParaCancelar.set(this.terapias().find((t) => t.idTerapia === id) ?? null);
  }

  confirmarCancelamento() {
    const alvo = this.terapiaParaCancelar();
    if (!alvo) return;
    if (!this.motivo.trim()) {
      this.erroCancelamento.set('Informe o motivo do cancelamento.');
      return;
    }

    this.cancelando.set(true);
    this.terapiaService.alterarStatus(alvo.idTerapia, { status: 'CANCELADA', motivo: this.motivo.trim() }).subscribe({
      next: () => {
        this.cancelando.set(false);
        this.terapiaParaCancelar.set(null);
        this.carregar();
      },
      error: (err) => {
        this.cancelando.set(false);
        this.erroCancelamento.set(mensagemDeErro(err, 'Não foi possível cancelar a terapia.'));
      },
    });
  }
}
