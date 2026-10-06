import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { FiltroAvancado, EstadoFiltroAvancado, OpcaoFiltroAvancado } from '../../../shared/components/filtro-avancado/filtro-avancado';
import { CardConsulta, ConsultaCard } from '../../../shared/components/card-consulta/card-consulta';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { ICONES } from '../../../shared/icons';
import { Modalidade, StatusTerapia } from '../../../core/models/consulta.model';

const LABEL_STATUS: Record<StatusTerapia, string> = {
  [StatusTerapia.AGENDADA]: 'Agendada',
  [StatusTerapia.CONCLUIDA]: 'Concluída',
  [StatusTerapia.CANCELADA]: 'Cancelada',
  [StatusTerapia.EM_ATENDIMENTO]: 'Em atendimento',
};

// Cor do indicador de cada pill de status no painel de filtros.
const COR_STATUS: Record<StatusTerapia, string> = {
  [StatusTerapia.AGENDADA]: '#2563eb',
  [StatusTerapia.CONCLUIDA]: '#16a34a',
  [StatusTerapia.CANCELADA]: '#ef4444',
  [StatusTerapia.EM_ATENDIMENTO]: '#d97706',
};

const LABEL_MODALIDADE: Record<Modalidade, string> = {
  [Modalidade.INDIVIDUAL]: 'Individual',
  [Modalidade.COLETIVA]: 'Coletiva',
};

export type PeriodoAtalho = 'hoje' | 'ontem' | 'amanha' | 'mes' | 'manual' | '';

interface ConsultaMock {
  id: string;
  nomePaciente: string;
  nomeEspecialista: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: Modalidade;
  status: StatusTerapia;
}

function inicioDoDia(d: Date): Date {
  const copia = new Date(d);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function fimDoDia(d: Date): Date {
  const copia = new Date(d);
  copia.setHours(23, 59, 59, 999);
  return copia;
}

@Component({
  selector: 'app-gerenciar-consultas',
  imports: [FormsModule, CardEstatistica, BuscaFiltro, FiltroAvancado, CardConsulta, CabecalhoPagina, Paginacao],
  templateUrl: './gerenciar-consultas.html',
  styleUrl: './gerenciar-consultas.scss',
})
export class GerenciarConsultas implements OnInit {
  icones = ICONES;
  carregando = signal(true);
  erro = signal('');

  statusDisponiveis: OpcaoFiltroAvancado[] = [
    { valor: StatusTerapia.AGENDADA, label: LABEL_STATUS[StatusTerapia.AGENDADA], cor: COR_STATUS[StatusTerapia.AGENDADA] },
    { valor: StatusTerapia.CONCLUIDA, label: LABEL_STATUS[StatusTerapia.CONCLUIDA], cor: COR_STATUS[StatusTerapia.CONCLUIDA] },
    { valor: StatusTerapia.CANCELADA, label: LABEL_STATUS[StatusTerapia.CANCELADA], cor: COR_STATUS[StatusTerapia.CANCELADA] },
    { valor: StatusTerapia.EM_ATENDIMENTO, label: LABEL_STATUS[StatusTerapia.EM_ATENDIMENTO], cor: COR_STATUS[StatusTerapia.EM_ATENDIMENTO] },
  ];

  periodosDisponiveis: OpcaoFiltroAvancado[] = [
    { valor: 'hoje', label: 'Hoje' },
    { valor: 'ontem', label: 'Ontem' },
    { valor: 'amanha', label: 'Amanhã' },
    { valor: 'mes', label: 'Mês' },
    { valor: 'manual', label: 'Selecionar datas' },
  ];

  private statusSelecionados = signal<Set<string>>(new Set());
  private periodoSelecionado = signal<PeriodoAtalho>('');
  private dataManualInicio = signal('');
  private dataManualFim = signal('');

  private todasConsultas = signal<ConsultaMock[]>([]);
  termoBusca = signal('');

  paginaAtual = signal(1);
  itensPorPagina = 9;

  private intervaloPeriodo = computed<[Date, Date] | null>(() => {
    const periodo = this.periodoSelecionado();
    const agora = new Date();

    switch (periodo) {
      case 'hoje':
        return [inicioDoDia(agora), fimDoDia(agora)];
      case 'ontem': {
        const ontem = new Date(agora);
        ontem.setDate(ontem.getDate() - 1);
        return [inicioDoDia(ontem), fimDoDia(ontem)];
      }
      case 'amanha': {
        const amanha = new Date(agora);
        amanha.setDate(amanha.getDate() + 1);
        return [inicioDoDia(amanha), fimDoDia(amanha)];
      }
      case 'mes': {
        const primeiroDia = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
        return [inicioDoDia(primeiroDia), fimDoDia(ultimoDia)];
      }
      case 'manual': {
        const inicio = this.dataManualInicio();
        const fim = this.dataManualFim();
        if (!inicio || !fim) return null;
        return [inicioDoDia(new Date(inicio + 'T00:00:00')), fimDoDia(new Date(fim + 'T00:00:00'))];
      }
      default:
        return null;
    }
  });

  consultasFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const status = this.statusSelecionados();
    const intervalo = this.intervaloPeriodo();

    return this.todasConsultas().filter((c) => {
      const bateTexto =
        !termo ||
        c.nomePaciente.toLowerCase().includes(termo) ||
        c.nomeEspecialista.toLowerCase().includes(termo);

      const bateStatus = status.size === 0 || status.has(c.status);

      const bateIntervalo =
        !intervalo || (new Date(c.dataHoraInicio) >= intervalo[0] && new Date(c.dataHoraInicio) <= intervalo[1]);

      return bateTexto && bateStatus && bateIntervalo;
    });
  });

  totalElementos = computed(() => this.consultasFiltradas().length);

  totalConcluidas = computed(
    () => this.todasConsultas().filter((c) => c.status === StatusTerapia.CONCLUIDA).length
  );
  totalAgendadas = computed(
    () => this.todasConsultas().filter((c) => c.status === StatusTerapia.AGENDADA).length
  );
  totalCanceladas = computed(
    () => this.todasConsultas().filter((c) => c.status === StatusTerapia.CANCELADA).length
  );

  consultasPaginadas = computed<ConsultaCard[]>(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.consultasFiltradas()
      .slice(inicio, inicio + this.itensPorPagina)
      .map((c) => this.paraCard(c));
  });

  ngOnInit() {
    // TODO(Kauã): trocar por chamada real quando existir TerapiaController/Repository
    // (ex: GET /terapias, paginado) — hoje a entidade Terapia existe no banco mas não
    // tem endpoint exposto.
    setTimeout(() => {
      this.todasConsultas.set([
        {
          id: '1',
          nomePaciente: 'Lucas Oliveira Santos',
          nomeEspecialista: 'Dra. Ana Souza',
          dataHoraInicio: '2026-10-05T09:00:00',
          dataHoraFim: '2026-10-05T09:50:00',
          modalidade: Modalidade.INDIVIDUAL,
          status: StatusTerapia.AGENDADA,
        },
        {
          id: '2',
          nomePaciente: 'Beatriz Lima',
          nomeEspecialista: 'Dr. Roberto Almeida',
          dataHoraInicio: '2026-09-28T14:00:00',
          dataHoraFim: '2026-09-28T15:30:00',
          modalidade: Modalidade.COLETIVA,
          status: StatusTerapia.CONCLUIDA,
        },
        {
          id: '3',
          nomePaciente: 'Pedro Henrique Costa',
          nomeEspecialista: 'Dra. Ana Souza',
          dataHoraInicio: '2026-09-20T10:00:00',
          dataHoraFim: '2026-09-20T10:50:00',
          modalidade: Modalidade.INDIVIDUAL,
          status: StatusTerapia.CANCELADA,
        },
      ]);
      this.carregando.set(false);
    }, 300);
  }

  private paraCard(c: ConsultaMock): ConsultaCard {
    return {
      id: c.id,
      nomePaciente: c.nomePaciente,
      nomeEspecialista: c.nomeEspecialista,
      dataHoraInicio: c.dataHoraInicio,
      dataHoraFim: c.dataHoraFim,
      modalidade: LABEL_MODALIDADE[c.modalidade],
      status: LABEL_STATUS[c.status],
    };
  }

  aplicarBusca(estado: EstadoBusca) {
    this.termoBusca.set(estado.termo);
    this.paginaAtual.set(1);
  }

  aplicarFiltroAvancado(estado: EstadoFiltroAvancado) {
    this.statusSelecionados.set(estado.status);
    this.periodoSelecionado.set((estado.periodo || '') as PeriodoAtalho);
    this.dataManualInicio.set(estado.dataInicio);
    this.dataManualFim.set(estado.dataFim);
    this.paginaAtual.set(1);
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
  }
}