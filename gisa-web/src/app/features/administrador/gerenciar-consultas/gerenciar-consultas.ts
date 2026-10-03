import { Component, OnInit, signal, computed } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, OpcaoFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
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

const LABEL_MODALIDADE: Record<Modalidade, string> = {
  [Modalidade.INDIVIDUAL]: 'Individual',
  [Modalidade.COLETIVA]: 'Coletiva',
};

interface ConsultaMock {
  id: string;
  nomePaciente: string;
  nomeEspecialista: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: Modalidade;
  status: StatusTerapia;
}

@Component({
  selector: 'app-gerenciar-consultas',
  imports: [CardEstatistica, BuscaFiltro, CardConsulta, CabecalhoPagina, Paginacao],
  templateUrl: './gerenciar-consultas.html',
  styleUrl: './gerenciar-consultas.scss',
})
export class GerenciarConsultas implements OnInit {
  icones = ICONES;
  carregando = signal(true);
  erro = signal('');

  filtros: OpcaoFiltro[] = [
    {
      chave: 'status',
      label: 'Status',
      opcoes: Object.entries(LABEL_STATUS).map(([valor, label]) => ({ valor, label })),
    },
  ];

  private todasConsultas = signal<ConsultaMock[]>([]);
  termoBusca = signal('');
  statusSelecionado = signal('');

  paginaAtual = signal(1);
  itensPorPagina = 9;

  consultasFiltradas = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const status = this.statusSelecionado();

    return this.todasConsultas().filter((c) => {
      const bateTexto =
        !termo ||
        c.nomePaciente.toLowerCase().includes(termo) ||
        c.nomeEspecialista.toLowerCase().includes(termo);
      const bateStatus = !status || c.status === status;
      return bateTexto && bateStatus;
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
    this.statusSelecionado.set(estado.filtros['status'] ?? '');
    this.paginaAtual.set(1);
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
  }
}