import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { dataCurta } from '../../../shared/utils/data.util';
import { NgIcon } from '@ng-icons/core';
import { ICONES } from '../../../shared/icons';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { SelectBusca, OpcaoSelectBusca } from '../../../shared/components/select-busca/select-busca';
import { buscaEspecialistas, buscaPacientes } from '../../../shared/components/select-busca/buscas';
import { PacienteService } from '../../../core/services/paciente';
import { ProfissionalService } from '../../../core/services/profissional';
import { TerapiaService } from '../../../core/services/terapia';
import { ConflitoHorario, NovaTerapiaPayload, Terapia } from '../../../core/models/terapia.model';
import { aplicarErrosApi, campoDaChave } from '../../../core/http/erro-api';
import { ROTULO_MODALIDADE } from '../../../shared/utils/rotulos.util';
import { paraIsoMinuto } from '../../../shared/utils/data.util';
import { lerContextoTerapias } from '../contexto-terapias';

// Chave de erro da API -> campo da tela
const CAMPOS_API: Record<string, string> = {
  pacientesIds: 'pacientes',
  especialistasIds: 'especialistas',
  data: 'data',
  horaInicio: 'horaInicio',
  horaTermino: 'horaTermino',
};

type TipoPessoa = 'paciente' | 'especialista';

// Um select da lista de pacientes ou de especialistas. O uid é estável: serve de
// track no @for e de chave de erro.
interface PessoaItem {
  uid: number;
  id: number | null;
}

// Criar (rota .../nova) e editar (rota .../:id/editar) terapia.
// Modalidade é calculada pela API: 1 paciente = individual; mais de um = coletiva.
@Component({
  selector: 'app-form-terapia',
  imports: [NgIcon, FormsModule, CabecalhoPagina, SelectBusca],
  templateUrl: './form-terapia.html',
  styleUrl: './form-terapia.scss',
})
export class FormTerapia implements OnInit {
  private avisoSucesso = inject(AvisoSucessoService);
  readonly icones = ICONES;
  private pacienteService = inject(PacienteService);
  private profissionalService = inject(ProfissionalService);
  private terapiaService = inject(TerapiaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private rotaBase = lerContextoTerapias(this.route).rotaBase;

  // Edição: id da terapia (null = nova).
  readonly idTerapia: number | null = this.route.snapshot.paramMap.get('id')
    ? Number(this.route.snapshot.paramMap.get('id'))
    : null;
  readonly editando = this.idTerapia !== null;

  private proximoUid = 1;
  private novoItem = (id: number | null = null): PessoaItem => ({ uid: this.proximoUid++, id });

  // Selects buscam na API conforme a digitação. Só pacientes matriculados e especialistas ativos
  // podem ser agendados.
  readonly buscarPacientes = buscaPacientes(this.pacienteService, { somenteMatriculados: true });
  readonly buscarEspecialistas = buscaEspecialistas(this.profissionalService);
  // Nomes dos participantes que já estão na terapia (edição), para os campos mostrarem quem é.
  opcoesPacientes = signal<OpcaoSelectBusca[]>([]);
  opcoesEspecialistas = signal<OpcaoSelectBusca[]>([]);

  // Campos do formulário
  pacientes = signal<PessoaItem[]>([this.novoItem()]);
  especialistas = signal<PessoaItem[]>([this.novoItem()]);
  data = signal('');
  horaInicio = signal('');
  horaTermino = signal('');

  modalidade = computed(() =>
    ROTULO_MODALIDADE[this.idsEscolhidos('paciente').length > 1 ? 'COLETIVA' : 'INDIVIDUAL']
  );

  // A API recusa agendar (ou remarcar) para um horário que já passou. Na edição, manter o
  // horário original é permitido (trocar só os participantes, por exemplo).
  private horarioOriginal = '';
  horarioPassado = computed(() => {
    if (!this.data() || !this.horaInicio()) return false;
    const horario = `${this.data()}T${this.horaInicio()}`;
    return horario !== this.horarioOriginal && horario < paraIsoMinuto(new Date());
  });

  // Estado da tela
  carregando = signal(this.editando);
  erroCarregar = signal('');
  erros = signal<Record<string, string>>({});
  erro = signal('');
  salvando = signal(false);
  idSalvo = signal<number | null>(null);

  // ---------- verificação de conflitos em tempo real ----------

  conflitos = signal<ConflitoHorario[]>([]);
  verificando = signal(false);

  // Corpo da verificação, ou null enquanto o formulário não está completo.
  private payloadVerificacao = computed<NovaTerapiaPayload | null>(() => {
    const pacientesIds = this.idsEscolhidos('paciente');
    const especialistasIds = this.idsEscolhidos('especialista');
    const data = this.data();
    const horaInicio = this.horaInicio();
    const horaTermino = this.horaTermino();
    if (!pacientesIds.length || !especialistasIds.length || !data || !horaInicio || !horaTermino) return null;
    if (horaTermino <= horaInicio) return null;
    return { pacientesIds, especialistasIds, data, horaInicio, horaTermino };
  });

  constructor() {
    toObservable(this.payloadVerificacao)
      .pipe(
        debounceTime(500),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap((payload) => {
          if (!payload) return of(null);
          this.verificando.set(true);
          return this.terapiaService
            .verificarConflitos({ ...payload, idTerapiaIgnorada: this.idTerapia ?? undefined })
            .pipe(catchError(() => of(null))); // aviso antecipado: falha aqui não bloqueia o salvar
        }),
        takeUntilDestroyed()
      )
      .subscribe((resultado) => {
        this.verificando.set(false);
        this.conflitos.set(resultado?.conflitos ?? []);
      });
  }

  emConflito(tipo: TipoPessoa, id: number | null): boolean {
    const alvo = tipo === 'paciente' ? 'PACIENTE' : 'ESPECIALISTA';
    return id !== null && this.conflitos().some((c) => c.tipo === alvo && c.idCadastro === id);
  }

  textoConflito(c: ConflitoHorario): string {
    const quem = c.tipo === 'PACIENTE' ? 'paciente' : 'especialista';
    return `${c.nome} (${quem}) já tem terapia das ${c.horaInicio} às ${c.horaTermino}.`;
  }

  // ---------- carregamento ----------

  ngOnInit() {
    if (this.editando) this.carregarTerapia(this.idTerapia!);
  }


  private carregarTerapia(id: number) {
    this.terapiaService.buscar(id).subscribe({
      next: (t) => {
        if (t.status !== 'AGENDADA') {
          this.erroCarregar.set('Só é possível editar terapias agendadas.');
        } else {
          this.preencher(t);
        }
        this.carregando.set(false);
      },
      error: (err) => {
        this.erroCarregar.set(err?.status === 404 ? 'Terapia não encontrada.' : 'Não foi possível carregar a terapia.');
        this.carregando.set(false);
      },
    });
  }

  private preencher(t: Terapia) {
    this.opcoesPacientes.set(t.pacientes.map((p) => ({ id: p.idCadastro, label: p.nome })));
    this.opcoesEspecialistas.set(t.especialistas.map((e) => ({ id: e.idCadastro, label: e.nome })));
    this.pacientes.set(t.pacientes.map((p) => this.novoItem(p.idCadastro)));
    this.especialistas.set(t.especialistas.map((e) => this.novoItem(e.idCadastro)));
    this.data.set(t.data);
    this.horaInicio.set(t.horaInicio.slice(0, 5));
    this.horaTermino.set(t.horaTermino.slice(0, 5));
    this.horarioOriginal = `${t.data}T${t.horaInicio.slice(0, 5)}`;
  }

  // ---------- listas de pessoas ----------

  lista(tipo: TipoPessoa) {
    return tipo === 'paciente' ? this.pacientes : this.especialistas;
  }

  adicionarPessoa(tipo: TipoPessoa) {
    this.lista(tipo).update((l) => [...l, this.novoItem()]);
  }

  removerPessoa(tipo: TipoPessoa, uid: number) {
    if (this.lista(tipo)().length <= 1) return;
    this.lista(tipo).update((l) => l.filter((x) => x.uid !== uid));
    this.limparErro(`${tipo}-${uid}`);
  }

  aoMudarPessoa(tipo: TipoPessoa, uid: number, id: number | string | null) {
    this.lista(tipo).update((l) => l.map((x) => (x.uid === uid ? { ...x, id: id as number | null } : x)));
    this.limparErro(`${tipo}-${uid}`);
    this.limparErro(tipo === 'paciente' ? 'pacientes' : 'especialistas');
  }

  private idsEscolhidos(tipo: TipoPessoa, ignorarUid?: number): number[] {
    return this.lista(tipo)()
      .filter((x) => x.uid !== ignorarUid && x.id !== null)
      .map((x) => x.id as number);
  }

  // Pessoas já escolhidas nos OUTROS campos do mesmo tipo (não aparecem de novo na busca).
  // Mesma referência enquanto nada muda, para não recalcular o select a cada ciclo.
  private escolhidosCache = new Map<string, { chave: string; ids: number[] }>();

  outrosEscolhidos(tipo: TipoPessoa, uid: number): number[] {
    const ids = this.idsEscolhidos(tipo, uid);
    const chave = ids.join(',');
    const guardado = this.escolhidosCache.get(`${tipo}:${uid}`);
    if (guardado && guardado.chave === chave) return guardado.ids;
    this.escolhidosCache.set(`${tipo}:${uid}`, { chave, ids });
    return ids;
  }

  limparErro(campo: string) {
    if (!this.erros()[campo]) return;
    this.erros.update((e) => {
      const copia = { ...e };
      delete copia[campo];
      return copia;
    });
  }

  // ---------- validação e salvar ----------

  private validar(): boolean {
    const OBRIGATORIO = 'Campo obrigatório.';
    const e: Record<string, string> = {};

    for (const tipo of ['paciente', 'especialista'] as const) {
      for (const item of this.lista(tipo)()) {
        if (item.id === null) e[`${tipo}-${item.uid}`] = 'Selecione a pessoa ou remova este campo.';
      }
    }
    if (!this.data()) e['data'] = OBRIGATORIO;
    if (!this.horaInicio()) e['horaInicio'] = OBRIGATORIO;
    if (!this.horaTermino()) e['horaTermino'] = OBRIGATORIO;
    else if (this.horaInicio() && this.horaTermino() <= this.horaInicio()) {
      e['horaTermino'] = 'O término deve ser depois do início.';
    }
    if (!e['data'] && !e['horaInicio'] && this.horarioPassado()) {
      e['horaInicio'] = 'Este horário já passou. Escolha um horário futuro.';
    }

    this.erros.set(e);
    return Object.keys(e).length === 0;
  }

  salvar() {
    if (this.salvando()) return;

    this.erro.set('');
    if (!this.validar()) {
      this.finalizarComErro('Preencha os campos obrigatórios destacados em vermelho.');
      return;
    }

    this.salvando.set(true);
    const dados: NovaTerapiaPayload = {
      pacientesIds: this.idsEscolhidos('paciente'),
      especialistasIds: this.idsEscolhidos('especialista'),
      data: this.data(),
      horaInicio: this.horaInicio(),
      horaTermino: this.horaTermino(),
    };

    const req = this.editando ? this.terapiaService.atualizar(this.idTerapia!, dados) : this.terapiaService.criar(dados);
    req.subscribe({
      next: (t) => {
        this.salvando.set(false);
        this.idSalvo.set(t.idTerapia);
        this.mostrarSucesso();
      },
      error: (err) => this.tratarErroApi(err),
    });
  }

  private tratarErroApi(err: unknown) {
    const novos: Record<string, string> = {};
    const { mensagemGeral } = aplicarErrosApi(
      err,
      (chave, mensagem) => {
        const destino = CAMPOS_API[campoDaChave(chave)];
        if (destino) novos[destino] = mensagem;
        return !!destino;
      },
      { padrao: 'Erro ao salvar a terapia.' }
    );

    if (Object.keys(novos).length) this.erros.update((e) => ({ ...e, ...novos }));
    this.finalizarComErro(mensagemGeral);
    // O horário pode ter sido ocupado depois da última verificação: atualiza os destaques.
    if (mensagemGeral.startsWith('Conflito de horário')) this.reverificarConflitos();
  }

  private reverificarConflitos() {
    const payload = this.payloadVerificacao();
    if (!payload) return;
    this.terapiaService
      .verificarConflitos({ ...payload, idTerapiaIgnorada: this.idTerapia ?? undefined })
      .subscribe({ next: (r) => this.conflitos.set(r.conflitos), error: () => {} });
  }

  private finalizarComErro(mensagem: string) {
    this.salvando.set(false);
    this.erro.set(mensagem);
    setTimeout(() => {
      document.querySelector('.input-erro, .erro-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  // ---------- diálogo de sucesso ----------

  verDetalhes() {
    this.router.navigate([this.rotaBase, this.idSalvo()]);
  }

  continuar() {
    if (this.editando) {
      this.router.navigateByUrl(this.rotaBase);
      return;
    }
    // Agendar outra: mantém data e horário, limpa as pessoas.
    this.pacientes.set([this.novoItem()]);
    this.especialistas.set([this.novoItem()]);
    this.erros.set({});
    this.conflitos.set([]);
  }

  cancelar() {
    this.router.navigateByUrl(this.rotaBase);
  }

  // Aviso de sucesso com os próximos passos (fim de fluxo).
  private mostrarSucesso() {
    this.avisoSucesso.mostrar({
      titulo: this.editando ? 'Terapia atualizada' : 'Terapia agendada',
      detalhe: `${dataCurta(this.data())}, ${this.horaInicio()} – ${this.horaTermino()}`,
      acoes: [
        { texto: this.editando ? 'Voltar à lista' : 'Agendar outra', acao: () => this.continuar() },
        { texto: 'Ver terapia', primaria: true, acao: () => this.verDetalhes() },
      ],
    });
  }
}
