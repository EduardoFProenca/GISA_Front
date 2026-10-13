import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../core/auth/auth';
import { EvolucaoPayload } from '../../../core/models/evolucao.model';
import { EventoPaciente } from '../../../core/models/historico.model';
import { Paciente } from '../../../core/models/paciente.model';
import { AlvoRemarcacao } from '../../../core/models/remarcacao.model';
import { Terapia } from '../../../core/models/terapia.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { mensagemDeErroRecurso } from '../../../core/services/endpoint-pendente';
import { EvolucaoService } from '../../../core/services/evolucao';
import { PacienteService } from '../../../core/services/paciente';
import { TerapiaService } from '../../../core/services/terapia';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ComErros } from '../../../shared/components/com-erros';
import { ModalRemarcacao } from '../../../shared/components/modal-remarcacao/modal-remarcacao';
import { dataCurta, paraIso } from '../../../shared/utils/data.util';
import { horaCurta } from '../../../shared/utils/data.util';
import { vazio } from '../../../shared/utils/texto.util';
import { TemPermissao } from '../../../core/auth/tem-permissao.directive';
import { AtestadoDrawer } from '../atestado/atestado-drawer';
import { AbaHistorico } from './componentes/aba-historico/aba-historico';
import { AbaTerapias } from './componentes/aba-terapias/aba-terapias';
import { CabecalhoPaciente } from './componentes/cabecalho-paciente/cabecalho-paciente';
import { calcularFrequenciaMes } from './frequencia.util';

type Aba = 'historico' | 'atendimento' | 'terapias';

const MIN_CARACTERES_EVOLUCAO = 10;

// Prontuário Eletrônico do Paciente (PEP) - RF09 / RF11 / CS06 / CS08.
// Rota: /especialista/atendimento/:idPaciente[?terapia=ID]
@Component({
  selector: 'app-atendimento-especialista',
  imports: [
    FormsModule,
    RouterLink,
    CabecalhoPagina,
    CabecalhoPaciente,
    AbaHistorico,
    AbaTerapias,
    ModalRemarcacao,
    AtestadoDrawer,
    TemPermissao,
  ],
  templateUrl: './atendimento.html',
  styleUrl: './atendimento.scss',
})
export class AtendimentoEspecialista extends ComErros implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);
  private pacienteService = inject(PacienteService);
  private terapiaService = inject(TerapiaService);
  private evolucaoService = inject(EvolucaoService);

  readonly idPaciente = Number(this.route.snapshot.paramMap.get('idPaciente'));
  // Sessão de onde o especialista veio (agenda / próximo paciente), se houver.
  readonly idTerapia = Number(this.route.snapshot.queryParamMap.get('terapia')) || null;
  readonly dataCurta = dataCurta;
  readonly horaCurta = horaCurta;
  readonly podeVerHistorico = this.auth.temPermissao('VISUALIZAR_HISTORICO_PACIENTE');

  // Estado que muda após resposta HTTP fica em signal.
  carregando = signal(true);
  erro = signal('');
  paciente = signal<Paciente | null>(null);
  aba = signal<Aba>(this.idTerapia ? 'atendimento' : 'historico');

  eventos = signal<EventoPaciente[]>([]);
  carregandoHistorico = signal(true);
  erroHistorico = signal('');

  terapiasMes = signal<Terapia[]>([]);
  carregandoTerapias = signal(true);
  erroTerapias = signal('');
  frequencia = computed(() => calcularFrequenciaMes(this.terapiasMes(), this.idPaciente));
  readonly mesReferencia = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  sessao = signal<Terapia | null>(null);

  salvando = signal(false);
  erroSalvar = signal('');
  aviso = signal('');
  remarcando = signal(false);
  atestadoAberto = signal(false);

  // Formulário da evolução (template-driven, como no restante do projeto).
  evolucao = { evolucaoPts: '', metas: '', condutas: '', orientacoesCuidadores: '' };

  // Sessão ainda pode ser remarcada (não concluída/cancelada).
  alvoRemarcacao = computed<AlvoRemarcacao | null>(() => {
    const s = this.sessao();
    const p = this.paciente();
    if (!s || !p || (s.status !== 'AGENDADA' && s.status !== 'EM_ATENDIMENTO')) return null;
    return { idTerapia: s.idTerapia, pacienteNome: p.pessoa.nome, data: s.data, horaInicio: horaCurta(s.horaInicio), horaTermino: horaCurta(s.horaTermino) };
  });

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
        this.erroHistorico.set(mensagemDeErroRecurso(err, 'Não foi possível carregar o histórico.'));
      },
    });
  }

  private carregarTerapiasDoMes() {
    const hoje = new Date();
    const inicio = paraIso(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    const fim = paraIso(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0));
    this.terapiaService.listar({ idPaciente: this.idPaciente, inicio, fim, size: 100 }).subscribe({
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
    // Sem a sessão o prontuário funciona igual; só não aparece o aviso nem o botão de remarcar.
    this.terapiaService.buscar(id).subscribe({ next: (t) => this.sessao.set(t), error: () => undefined });
  }

  trocarAba(aba: Aba) {
    this.aba.set(aba);
  }

  private validar(): boolean {
    const erros: Record<string, string> = {};
    const texto = this.evolucao.evolucaoPts.trim();

    if (vazio(texto)) erros['evolucaoPts'] = 'Descreva a evolução clínica do atendimento.';
    else if (texto.length < MIN_CARACTERES_EVOLUCAO) {
      erros['evolucaoPts'] = `A evolução precisa ter ao menos ${MIN_CARACTERES_EVOLUCAO} caracteres.`;
    }

    this.erros = erros;
    return Object.keys(erros).length === 0;
  }

  salvarEvolucao() {
    if (this.salvando()) return;
    this.aviso.set('');
    this.erroSalvar.set('');
    this.aba.set('atendimento'); // os erros de validação aparecem nesta aba

    if (!this.validar()) return;

    const payload: EvolucaoPayload = {
      idTerapia: this.sessao()?.idTerapia ?? this.idTerapia,
      evolucaoPts: this.evolucao.evolucaoPts.trim(),
      metas: this.evolucao.metas.trim(),
      condutas: this.evolucao.condutas.trim(),
      orientacoesCuidadores: this.evolucao.orientacoesCuidadores.trim(),
    };

    this.salvando.set(true);
    this.evolucaoService.salvar(this.idPaciente, payload).subscribe({
      next: () => {
        this.evolucao = { evolucaoPts: '', metas: '', condutas: '', orientacoesCuidadores: '' };
        this.salvando.set(false);
        this.aviso.set('Evolução salva no prontuário.');
      },
      error: (err) => {
        this.salvando.set(false);
        this.erroSalvar.set(mensagemDeErroRecurso(err, 'Não foi possível salvar a evolução. Tente novamente.'));
      },
    });
  }

  abrirRemarcacao() {
    this.remarcando.set(true);
  }

  aoSolicitarRemarcacao() {
    this.remarcando.set(false);
    this.aviso.set('Solicitação de remarcação enviada. Status: pendente.');
  }
}
