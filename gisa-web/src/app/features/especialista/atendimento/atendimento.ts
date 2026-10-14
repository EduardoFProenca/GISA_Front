import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth } from '../../../core/auth/auth';
import { EventoPaciente } from '../../../core/models/historico.model';
import { Paciente } from '../../../core/models/paciente.model';
import { Terapia, TerapiaDoEspecialista } from '../../../core/models/terapia.model';
import { Pagina } from '../../../core/models/comum.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { PacienteService } from '../../../core/services/paciente';
import { TerapiaService } from '../../../core/services/terapia';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { dataCurta, paraIso } from '../../../shared/utils/data.util';
import { horaCurta } from '../../../shared/utils/data.util';
import { TemPermissao } from '../../../core/auth/tem-permissao.directive';
import { DocumentoClinicoDrawer } from '../documento-clinico/documento-clinico-drawer';
import { TipoDocumentoClinico } from '../documento-clinico/documento-clinico.util';
import { AbaHistorico } from './componentes/aba-historico/aba-historico';
import { AbaTerapias } from './componentes/aba-terapias/aba-terapias';
import { CabecalhoPaciente } from './componentes/cabecalho-paciente/cabecalho-paciente';
import { calcularFrequenciaMes } from './frequencia.util';

type Aba = 'historico' | 'terapias';

// Prontuário Eletrônico do Paciente (PEP) - RF09 / RF11 / CS06 / CS08.
// Rota: /especialista/atendimento/:idPaciente[?terapia=ID]
@Component({
  selector: 'app-atendimento-especialista',
  imports: [
    RouterLink,
    CabecalhoPagina,
    CabecalhoPaciente,
    AbaHistorico,
    AbaTerapias,
    DocumentoClinicoDrawer,
    TemPermissao,
  ],
  templateUrl: './atendimento.html',
  styleUrl: './atendimento.scss',
})
export class AtendimentoEspecialista implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);
  private pacienteService = inject(PacienteService);
  private terapiaService = inject(TerapiaService);

  readonly idPaciente = Number(this.route.snapshot.paramMap.get('idPaciente'));
  // Sessão de onde o especialista veio (agenda / próximo paciente), se houver.
  readonly idTerapia = Number(this.route.snapshot.queryParamMap.get('terapia')) || null;
  readonly dataCurta = dataCurta;
  readonly horaCurta = horaCurta;
  readonly podeVerHistorico = this.auth.temPermissao('VISUALIZAR_HISTORICO_PACIENTE');
  // O especialista não tem VISUALIZAR_TERAPIAS: vê só as terapias dele com o paciente (/terapias/minhas).
  private readonly veTodasAsTerapias = this.auth.temPermissao('VISUALIZAR_TERAPIAS');

  // Estado que muda após resposta HTTP fica em signal.
  carregando = signal(true);
  erro = signal('');
  paciente = signal<Paciente | null>(null);
  aba = signal<Aba>('historico');

  eventos = signal<EventoPaciente[]>([]);
  carregandoHistorico = signal(true);
  erroHistorico = signal('');

  terapiasMes = signal<(Terapia | TerapiaDoEspecialista)[]>([]);
  carregandoTerapias = signal(true);
  erroTerapias = signal('');
  frequencia = computed(() => calcularFrequenciaMes(this.terapiasMes(), this.idPaciente));
  readonly mesReferencia = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  sessao = signal<Terapia | null>(null);

  // Atestado ou receita aberto no drawer (null = fechado).
  documentoAberto = signal<TipoDocumentoClinico | null>(null);


  ngOnInit() {
    if (!Number.isFinite(this.idPaciente)) {
      this.carregando.set(false);
      this.erro.set('Paciente inválido.');
      return;
    }

    this.pacienteService.buscar(this.idPaciente).subscribe({
      next: (p) => {
        this.paciente.set(p);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.status === 404 ? 'Paciente não encontrado.' : mensagemDeErro(err, 'Não foi possível carregar o prontuário.'));
      },
    });

    this.carregarHistorico();
    this.carregarTerapiasDoMes();
    if (this.idTerapia) this.carregarSessao(this.idTerapia);
  }

  private carregarHistorico() {
    if (!this.podeVerHistorico) {
      this.carregandoHistorico.set(false);
      this.erroHistorico.set('Você não tem permissão para ver o histórico deste paciente.');
      return;
    }
    this.pacienteService.historico(this.idPaciente, { size: 50 }).subscribe({
      next: (p) => {
        this.eventos.set(p.content);
        this.carregandoHistorico.set(false);
      },
      error: (err) => {
        this.carregandoHistorico.set(false);
        this.erroHistorico.set(mensagemDeErro(err, 'Não foi possível carregar o histórico.'));
      },
    });
  }

  private carregarTerapiasDoMes() {
    const hoje = new Date();
    const inicio = paraIso(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    const fim = paraIso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));
    const filtro = { idPaciente: this.idPaciente, inicio, fim, size: 100 };
    const pedido: Observable<Pagina<Terapia | TerapiaDoEspecialista>> = this.veTodasAsTerapias ? this.terapiaService.listar(filtro) : this.terapiaService.minhas(filtro);
    pedido.subscribe({
      next: (p) => {
        this.terapiasMes.set(p.content);
        this.carregandoTerapias.set(false);
      },
      error: (err) => {
        this.carregandoTerapias.set(false);
        this.erroTerapias.set(mensagemDeErro(err, 'Não foi possível carregar as terapias do mês.'));
      },
    });
  }

  private carregarSessao(id: number) {
    // Sem a sessão o prontuário funciona igual; só não aparece a linha da sessão.
    this.terapiaService.buscar(id).subscribe({ next: (t) => this.sessao.set(t), error: () => undefined });
  }

  trocarAba(aba: Aba) {
    this.aba.set(aba);
  }
}
