import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { FiltroAvancado, EstadoFiltroAvancado, OpcaoFiltroAvancado } from '../../../shared/components/filtro-avancado/filtro-avancado';
import { CardConsulta, ConsultaCard } from '../../../shared/components/card-consulta/card-consulta';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
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

export type PeriodoAtalho = 'hoje' | 'ontem' | 'amanha' | 'mes' | 'manual' | '';

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
  imports: [FormsModule, CardEstatistica, BuscaFiltro, FiltroAvancado, CardConsulta, CabecalhoPagina, Paginacao, ConfirmDialog],
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

  private todasConsultas = signal<ConsultaCard[]>([]);
  termoBusca = signal('');

  // Consulta aguardando confirmação de cancelamento (null = diálogo fechado).
  consultaParaCancelar = signal<ConsultaCard | null>(null);

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
      // A busca vale para qualquer participante (paciente ou especialista).
      const bateTexto =
        !termo || c.participantes.some((p) => p.nome.toLowerCase().includes(termo));

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
    return this.consultasFiltradas().slice(inicio, inicio + this.itensPorPagina);
  });

  mensagemCancelamento = computed(() => {
    const consulta = this.consultaParaCancelar();
    if (!consulta) return '';
    const quando = consulta.dataHoraInicio.split('T')[0].split('-').reverse().join('/');
    const tipo = consulta.modalidade === Modalidade.COLETIVA ? 'coletiva' : 'individual';
    return `A consulta ${tipo} do dia ${quando} será marcada como cancelada.`;
  });

  ngOnInit() {
    // TODO(Kauã): trocar por chamada real quando existir TerapiaController/Repository
    // (ex: GET /terapias, paginado) — hoje a entidade Terapia existe no banco mas não
    // tem endpoint exposto. A API precisa devolver a lista de participantes
    // (pacientes + especialistas) de cada terapia, já que a coletiva tem vários.
    setTimeout(() => {
      this.todasConsultas.set([
        {
          id: '1',
          dataHoraInicio: '2026-10-05T09:00:00',
          dataHoraFim: '2026-10-05T09:50:00',
          modalidade: Modalidade.INDIVIDUAL,
          status: StatusTerapia.AGENDADA,
          participantes: [
            { id: 'p1', nome: 'Lucas Oliveira Santos', tipo: 'PACIENTE' },
            { id: 'e1', nome: 'Dra. Ana Souza', tipo: 'ESPECIALISTA' },
          ],
        },
        {
          id: '2',
          dataHoraInicio: '2026-09-28T14:00:00',
          dataHoraFim: '2026-09-28T15:30:00',
          modalidade: Modalidade.COLETIVA,
          status: StatusTerapia.CONCLUIDA,
          participantes: [
            { id: 'e2', nome: 'Dr. Roberto Almeida', tipo: 'ESPECIALISTA' },
            { id: 'e1', nome: 'Dra. Ana Souza', tipo: 'ESPECIALISTA' },
            { id: 'p2', nome: 'Beatriz Lima', tipo: 'PACIENTE' },
            { id: 'p3', nome: 'Mateus Rocha Pereira', tipo: 'PACIENTE' },
            { id: 'p4', nome: 'Sofia Andrade', tipo: 'PACIENTE' },
            { id: 'p5', nome: 'Pedro Henrique Costa', tipo: 'PACIENTE' },
          ],
        },
        {
          id: '3',
          dataHoraInicio: '2026-09-20T10:00:00',
          dataHoraFim: '2026-09-20T10:50:00',
          modalidade: Modalidade.INDIVIDUAL,
          status: StatusTerapia.CANCELADA,
          participantes: [
            { id: 'p5', nome: 'Pedro Henrique Costa', tipo: 'PACIENTE' },
            { id: 'e1', nome: 'Dra. Ana Souza', tipo: 'ESPECIALISTA' },
          ],
        },
        {
          id: '4',
          dataHoraInicio: '2026-10-09T10:00:00',
          dataHoraFim: '2026-10-09T11:00:00',
          modalidade: Modalidade.COLETIVA,
          status: StatusTerapia.AGENDADA,
          participantes: [
            { id: 'e2', nome: 'Dr. Roberto Almeida', tipo: 'ESPECIALISTA' },
            { id: 'p2', nome: 'Beatriz Lima', tipo: 'PACIENTE' },
            { id: 'p4', nome: 'Sofia Andrade', tipo: 'PACIENTE' },
          ],
        },
      ]);
      this.carregando.set(false);
    }, 300);
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

  // --- Ações do card ---

  verDetalhes(id: string) {
    // TODO(Kauã): navegar para o detalhe da consulta (rota ainda não existe).
  }

  editarConsulta(id: string) {
    // TODO(Kauã): navegar para a edição da consulta (rota e endpoint ainda não existem).
  }

  adicionarPessoas(id: string) {
    // TODO(Kauã): abrir diálogo para escolher pacientes e/ou especialistas e
    // chamar a API que vincula os participantes à terapia coletiva.
  }

  pedirCancelamento(id: string) {
    const consulta = this.todasConsultas().find((c) => c.id === id) ?? null;
    this.consultaParaCancelar.set(consulta);
  }

  fecharCancelamento() {
    this.consultaParaCancelar.set(null);
  }

  confirmarCancelamento() {
    const alvo = this.consultaParaCancelar();
    if (!alvo) return;

    // TODO(Kauã): trocar por chamada real (ex: PATCH /terapias/{id}/cancelar).
    // Por enquanto só atualiza o mock em memória.
    this.todasConsultas.update((lista) =>
      lista.map((c) => (c.id === alvo.id ? { ...c, status: StatusTerapia.CANCELADA } : c))
    );
    this.consultaParaCancelar.set(null);
  }
}