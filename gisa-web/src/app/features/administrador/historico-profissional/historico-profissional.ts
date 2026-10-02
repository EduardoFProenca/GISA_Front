import { Component, OnInit, inject, signal, computed, Signal, WritableSignal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { BuscaFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { PainelAcoesComponent, AcaoRapida } from '../../../shared/components/painel-acoes/painel-acoes';
import { ICONES } from '../../../shared/icons';
import { Modalidade, StatusTerapia } from '../../../core/models/consulta.model';

export interface EventoHistorico {
  data: string;
  titulo: string;
  descricao: string;
}

export interface ConsultaRealizada {
  dataHoraInicio: string;
  dataHoraFim: string;
  modalidade: Modalidade;
  status: StatusTerapia;
  nomeEspecialista: string;
}

const ICONE_POR_PALAVRA_CHAVE: { chave: string; icone: string }[] = [
  { chave: 'cadastro', icone: ICONES.cadastrarProfissional },
  { chave: 'status', icone: ICONES.gestaoProfissionais },
  { chave: 'atualiz', icone: ICONES.editar },
  { chave: 'agenda', icone: ICONES.criacaoAgenda },
  { chave: 'consulta', icone: ICONES.gestaoConsultas },
];

function iconePara(titulo: string): string {
  const alvo = titulo.toLowerCase();
  const encontrado = ICONE_POR_PALAVRA_CHAVE.find((i) => alvo.includes(i.chave));
  return encontrado?.icone ?? ICONES.estrela;
}

const LABEL_STATUS_TERAPIA: Record<StatusTerapia, string> = {
  [StatusTerapia.AGENDADA]: 'Agendada',
  [StatusTerapia.CONCLUIDA]: 'Concluída',
  [StatusTerapia.CANCELADA]: 'Cancelada',
  [StatusTerapia.EM_ATENDIMENTO]: 'Em atendimento',
};

const LABEL_MODALIDADE: Record<Modalidade, string> = {
  [Modalidade.INDIVIDUAL]: 'Individual',
  [Modalidade.COLETIVA]: 'Coletiva',
};

function iconeParaConsulta(status: StatusTerapia): string {
  return status === StatusTerapia.CANCELADA ? ICONES.sino : ICONES.gestaoConsultas;
}

class SecaoHistorico<T> {
  termoBusca = signal('');
  paginaAtual = signal(1);
  readonly itensPorPagina: number;

  private todos: WritableSignal<T[]> = signal([]);
  itensFiltrados: Signal<T[]>;
  acoesPaginadas: Signal<AcaoRapida[]>;

  constructor(itensPorPagina: number, private paraTexto: (item: T) => string, private paraAcao: (item: T) => AcaoRapida) {
    this.itensPorPagina = itensPorPagina;

    this.itensFiltrados = computed(() => {
      const termo = this.termoBusca().trim().toLowerCase();
      if (!termo) return this.todos();
      return this.todos().filter((item) => this.paraTexto(item).toLowerCase().includes(termo));
    });

    this.acoesPaginadas = computed(() => {
      const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
      return this.itensFiltrados()
        .slice(inicio, inicio + this.itensPorPagina)
        .map((item) => this.paraAcao(item));
    });
  }

  definirItens(itens: T[]) {
    this.todos.set(itens);
  }

  aplicarBusca(estado: EstadoBusca) {
    this.termoBusca.set(estado.termo);
    this.paginaAtual.set(1);
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
  }
}

@Component({
  selector: 'app-historico-profissional',
  imports: [CabecalhoPagina, BuscaFiltro, Paginacao, PainelAcoesComponent],
  templateUrl: './historico-profissional.html',
  styleUrl: './historico-profissional.scss',
})
export class HistoricoProfissional implements OnInit {
  private route = inject(ActivatedRoute);

  id: string = this.route.snapshot.paramMap.get('id') ?? '';
  carregandoEventos = signal(true);
  carregandoConsultas = signal(true);

  eventos = new SecaoHistorico<EventoHistorico>(
    6,
    (e) => `${e.titulo} ${e.descricao}`,
    (e) => ({
      titulo: e.titulo,
      descricao: `${this.formatarData(e.data)} — ${e.descricao}`,
      iconeSvg: iconePara(e.titulo),
      rota: '.',
    })
  );

  consultas = new SecaoHistorico<ConsultaRealizada>(
    6,
    (c) => `${c.nomeEspecialista} ${LABEL_MODALIDADE[c.modalidade]} ${LABEL_STATUS_TERAPIA[c.status]}`,
    (c) => ({
      titulo: `${LABEL_MODALIDADE[c.modalidade]} com ${c.nomeEspecialista}`,
      descricao: `${this.formatarDataHora(c.dataHoraInicio)} — ${LABEL_STATUS_TERAPIA[c.status]}`,
      iconeSvg: iconeParaConsulta(c.status),
      rota: '.',
    })
  );

  ngOnInit() {
    // TODO(Kauã): trocar por chamada real ao service, usando this.id
    // (ex: GET /profissionais/:id/historico). Não existe endpoint ainda.
    setTimeout(() => {
      this.eventos.definirItens([
        { data: '2026-08-12', titulo: 'Cadastro criado', descricao: 'Profissional cadastrado no sistema.' },
        { data: '2026-09-03', titulo: 'Dados atualizados', descricao: 'Telefone e endereço alterados.' },
        { data: '2026-09-20', titulo: 'Status alterado', descricao: 'Status alterado para Ativo.' },
      ]);
      this.carregandoEventos.set(false);
    }, 300);

    // TODO(Kauã): trocar por chamada real quando existir TerapiaController/Repository
    // (ex: GET /profissionais/:id/terapias) — hoje a entidade Terapia existe no banco
    // mas não tem endpoint exposto.
    setTimeout(() => {
      this.consultas.definirItens([
        {
          dataHoraInicio: '2026-07-15T09:00:00',
          dataHoraFim: '2026-07-15T09:50:00',
          modalidade: Modalidade.INDIVIDUAL,
          status: StatusTerapia.CONCLUIDA,
          nomeEspecialista: 'Dra. Ana Souza',
        },
        {
          dataHoraInicio: '2026-08-02T14:00:00',
          dataHoraFim: '2026-08-02T15:30:00',
          modalidade: Modalidade.COLETIVA,
          status: StatusTerapia.CONCLUIDA,
          nomeEspecialista: 'Dr. Roberto Almeida',
        },
        {
          dataHoraInicio: '2026-08-20T10:00:00',
          dataHoraFim: '2026-08-20T10:50:00',
          modalidade: Modalidade.INDIVIDUAL,
          status: StatusTerapia.CANCELADA,
          nomeEspecialista: 'Dra. Ana Souza',
        },
      ]);
      this.carregandoConsultas.set(false);
    }, 300);
  }

  private formatarData(dataIso: string): string {
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  private formatarDataHora(dataHoraIso: string): string {
    const [dataIso, horaCompleta] = dataHoraIso.split('T');
    const hora = horaCompleta?.slice(0, 5) ?? '';
    return `${this.formatarData(dataIso)} às ${hora}`;
  }
}