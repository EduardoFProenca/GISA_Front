import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ItemAgenda, StatusAgenda } from '../../../core/models/agenda-especialista.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { AgendaEspecialistaService } from '../../../core/services/agenda-especialista';
import { EspecialistaLogadoService } from '../../../core/services/especialista-logado';
import { BuscaFiltro, EstadoBusca, OpcaoFiltro } from '../../../shared/components/busca-filtro/busca-filtro';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { dataCurta, dataExtenso, hojeIso, somarDias } from '../../../shared/utils/data.util';
import { ROTULO_MODALIDADE } from '../../../shared/utils/rotulos.util';
import {
  NOMES_DIAS_SEMANA,
  ROTULO_STATUS_AGENDA,
  agruparPorDia,
  diasDaSemana,
  filtrarAgenda,
  formatarMatricula,
  montarGrade,
  rotuloMes,
  statusAgenda,
} from './agenda.util';

type Visao = 'dia' | 'semana';

const MAX_CHIPS_POR_DIA = 3;

// Agenda do especialista logado (RF04 / CS01). Dados: GET /terapias/minhas.
@Component({
  selector: 'app-agenda-especialista',
  imports: [CabecalhoPagina, BuscaFiltro],
  templateUrl: './agenda-especialista.html',
  styleUrl: './agenda-especialista.scss',
})
export class AgendaEspecialista implements OnInit {
  private agendaService = inject(AgendaEspecialistaService);
  private router = inject(Router);
  private perfilService = inject(EspecialistaLogadoService);

  readonly diasSemana = NOMES_DIAS_SEMANA;
  readonly maxChips = MAX_CHIPS_POR_DIA;
  readonly rotuloStatus = ROTULO_STATUS_AGENDA;
  readonly rotuloModalidade = ROTULO_MODALIDADE;
  readonly statusDe = statusAgenda;
  readonly matricula = formatarMatricula;
  readonly dataCurta = dataCurta;
  readonly dataExtenso = dataExtenso;

  readonly filtrosDisponiveis: OpcaoFiltro[] = [
    {
      chave: 'status',
      label: 'Status',
      opcoes: (Object.keys(ROTULO_STATUS_AGENDA) as StatusAgenda[]).map((valor) => ({
        valor,
        label: ROTULO_STATUS_AGENDA[valor],
      })),
    },
    {
      chave: 'modalidade',
      label: 'Modalidade',
      opcoes: [
        { valor: 'INDIVIDUAL', label: 'Individual' },
        { valor: 'COLETIVA', label: 'Coletiva' },
      ],
    },
  ];

  // --- estado ---
  hoje = hojeIso();
  ano = signal(Number(this.hoje.slice(0, 4)));
  mes = signal(Number(this.hoje.slice(5, 7))); // 1-12
  selecionada = signal(this.hoje);
  visao = signal<Visao>('dia');

  agendamentos = signal<ItemAgenda[]>([]);
  carregando = signal(true);
  erro = signal('');

  termo = signal('');
  filtroStatus = signal('');
  filtroModalidade = signal('');

  detalhe = signal<ItemAgenda | null>(null);
  especialidade = signal('');

  // --- derivados ---
  grade = computed(() => montarGrade(this.ano(), this.mes()));
  tituloMes = computed(() => rotuloMes(this.ano(), this.mes()));
  visiveis = computed(() =>
    filtrarAgenda(this.agendamentos(), this.termo(), this.filtroStatus(), this.filtroModalidade())
  );
  porDia = computed(() => agruparPorDia(this.visiveis()));
  diasDaLista = computed(() => (this.visao() === 'semana' ? diasDaSemana(this.selecionada()) : [this.selecionada()]));
  totalNaLista = computed(() => this.diasDaLista().reduce((n, d) => n + (this.porDia().get(d)?.length ?? 0), 0));

  // Evita que uma resposta antiga sobrescreva a de um mês escolhido depois.
  private requisicao = 0;

  ngOnInit() {
    this.carregar();
    // A especialidade é só informativa no detalhe: se falhar, o detalhe segue sem ela.
    this.perfilService.perfil().subscribe({
      next: (p) => this.especialidade.set(p.especialidades.join(', ')),
      error: () => undefined,
    });
  }

  carregar() {
    const atual = ++this.requisicao;
    const { inicioIso, fimIso } = this.grade();
    this.carregando.set(true);
    this.erro.set('');

    this.agendaService.listarPeriodo(inicioIso, fimIso).subscribe({
      next: (lista) => {
        if (atual !== this.requisicao) return;
        this.agendamentos.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        if (atual !== this.requisicao) return;
        this.agendamentos.set([]);
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar a agenda.'));
      },
    });
  }

  // --- navegação ---
  mudarMes(delta: number) {
    const d = new Date(this.ano(), this.mes() - 1 + delta, 1);
    this.irParaMes(d.getFullYear(), d.getMonth() + 1);
  }

  irParaHoje() {
    this.hoje = hojeIso();
    const [ano, mes] = [Number(this.hoje.slice(0, 4)), Number(this.hoje.slice(5, 7))];
    if (ano !== this.ano() || mes !== this.mes()) this.irParaMes(ano, mes, this.hoje);
    else this.selecionada.set(this.hoje);
  }

  private irParaMes(ano: number, mes: number, diaSelecionado?: string) {
    this.ano.set(ano);
    this.mes.set(mes);
    const mesTexto = String(mes).padStart(2, '0');
    const hojeNoMes = this.hoje.startsWith(`${ano}-${mesTexto}`);
    this.selecionada.set(diaSelecionado ?? (hojeNoMes ? this.hoje : `${ano}-${mesTexto}-01`));
    this.carregar();
  }

  selecionarDia(iso: string) {
    this.selecionada.set(iso);
    // clicou num dia de outro mês exibido na grade: acompanha o mês dele
    const [ano, mes] = [Number(iso.slice(0, 4)), Number(iso.slice(5, 7))];
    if (ano !== this.ano() || mes !== this.mes()) this.irParaMes(ano, mes, iso);
  }

  mudarPeriodo(delta: number) {
    this.selecionarDia(somarDias(this.selecionada(), delta * (this.visao() === 'semana' ? 7 : 1)));
  }

  mudarVisao(v: Visao) {
    this.visao.set(v);
  }

  aplicarBusca(estado: EstadoBusca) {
    this.termo.set(estado.termo);
    this.filtroStatus.set(estado.filtros['status'] ?? '');
    this.filtroModalidade.set(estado.filtros['modalidade'] ?? '');
  }

  doDia(iso: string): ItemAgenda[] {
    return this.porDia().get(iso) ?? [];
  }

  rotuloSemana(): string {
    const dias = diasDaSemana(this.selecionada());
    return `${dataCurta(dias[0])} a ${dataCurta(dias[6])}`;
  }

  // --- detalhe e ações ---
  abrirDetalhe(a: ItemAgenda, evento?: Event) {
    evento?.stopPropagation();
    this.detalhe.set(a);
  }

  fecharDetalhe() {
    this.detalhe.set(null);
  }

  podeAbrirProntuario(a: ItemAgenda): boolean {
    return statusAgenda(a) !== 'CANCELADA';
  }

  abrirProntuario(a: ItemAgenda) {
    this.fecharDetalhe();
    this.router.navigate(['/especialista/atendimento', a.idPaciente], { queryParams: { terapia: a.idTerapia } });
  }
}
