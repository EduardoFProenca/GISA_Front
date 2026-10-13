import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { SelectBusca, OpcaoSelectBusca } from '../../../shared/components/select-busca/select-busca';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { PacienteService } from '../../../core/services/paciente';
import { ProfissionalService } from '../../../core/services/profissional';
import { TerapiaService } from '../../../core/services/terapia';
import { PacienteResumo } from '../../../core/models/paciente.model';
import { ProfissionalResumo } from '../../../core/models/profissional.model';
import { Modalidade, NovaTerapia } from '../../../core/models/consulta.model';
import { aplicarErrosApi, campoDaChave } from '../../../core/http/erro-api';

// Chave de erro da API -> campo da tela
const CAMPOS_API: Record<string, string> = {
  idPaciente: 'paciente',
  idEspecialista: 'especialista',
  idsPacientesAdicionais: 'participantes',
  idsEspecialistasAdicionais: 'participantes',
  modalidade: 'modalidade',
  dataHoraInicio: 'data',
  dataHoraFim: 'horaTermino',
};

type TipoPessoa = 'paciente' | 'especialista';

// Um select extra (pessoa além da principal) numa consulta coletiva.
// O uid é estável: serve de track no @for e de chave de erro.
interface PessoaExtra {
  uid: number;
  id: number | null;
}

@Component({
  selector: 'app-criar-consulta',
  imports: [FormsModule, CabecalhoPagina, SucessoDialog, SelectBusca],
  templateUrl: './criar-consulta.html',
  styleUrl: './criar-consulta.scss',
})
export class CriarConsulta implements OnInit {
  private pacienteService = inject(PacienteService);
  private profissionalService = inject(ProfissionalService);
  private terapiaService = inject(TerapiaService);
  private router = inject(Router);

  // Listas dos selects
  pacientes = signal<PacienteResumo[]>([]);
  especialistas = signal<ProfissionalResumo[]>([]);

  opcoesPacientes = signal<OpcaoSelectBusca[]>([]);
  opcoesEspecialistas = signal<OpcaoSelectBusca[]>([]);
  modalidades = [
    { valor: Modalidade.INDIVIDUAL, label: 'Individual' },
    { valor: Modalidade.COLETIVA, label: 'Coletiva' },
  ];

  // Campos do formulário
  idPaciente = signal<number | null>(null);
  idEspecialista = signal<number | null>(null);
  modalidade = signal<Modalidade | ''>('');
  data = signal('');
  horaInicio = signal('');
  horaTermino = signal('');

  // Pessoas extras (só valem quando a modalidade é COLETIVA)
  pacientesExtras = signal<PessoaExtra[]>([]);
  especialistasExtras = signal<PessoaExtra[]>([]);
  private proximoUid = 1;

  ehColetiva = computed(() => this.modalidade() === Modalidade.COLETIVA);

  // Estado da tela
  erros = signal<Record<string, string>>({});
  erro = signal('');
  salvando = signal(false);
  dialogSucessoAberto = signal(false);

  ngOnInit() {
    this.pacienteService.listar({ size: 1000 }).subscribe({
      next: ({ content: lista }) => {
        this.pacientes.set(lista);
        this.opcoesPacientes.set(lista.map((p) => ({ id: p.idCadastro, label: p.nome })));
      },
      error: () => this.erro.set('Não foi possível carregar a lista de pacientes.'),
    });

    this.profissionalService.listarEspecialistas().subscribe({
      next: (lista) => {
        this.especialistas.set(lista);
        this.opcoesEspecialistas.set(lista.map((e) => ({ id: e.idProfissional, label: e.nome })));
      },
      error: () => this.erro.set('Não foi possível carregar a lista de profissionais.'),
    });
  }

  aoMudarPaciente(id: number | string | null) {
    this.idPaciente.set(id as number | null);
    this.limparErro('paciente');
  }

  aoMudarEspecialista(id: number | string | null) {
    this.idEspecialista.set(id as number | null);
    this.limparErro('especialista');
  }

  limparErro(campo: string) {
    if (!this.erros()[campo]) return;
    this.erros.update((e) => {
      const copia = { ...e };
      delete copia[campo];
      return copia;
    });
  }

  // ---------- pessoas extras (consulta coletiva) ----------

  private extras(tipo: TipoPessoa) {
    return tipo === 'paciente' ? this.pacientesExtras : this.especialistasExtras;
  }

  adicionarPessoa(tipo: TipoPessoa) {
    this.extras(tipo).update((lista) => [...lista, { uid: this.proximoUid++, id: null }]);
  }

  removerPessoa(tipo: TipoPessoa, uid: number) {
    this.extras(tipo).update((lista) => lista.filter((x) => x.uid !== uid));
    this.cacheOpcoes.delete(`${tipo}:${uid}`);
    this.limparErro(`${tipo}-${uid}`);
    this.limparErro('participantes');
  }

  aoMudarExtra(tipo: TipoPessoa, uid: number, id: number | string | null) {
    this.extras(tipo).update((lista) =>
      lista.map((x) => (x.uid === uid ? { ...x, id: id as number | null } : x))
    );
    this.limparErro(`${tipo}-${uid}`);
    this.limparErro('participantes');
  }

  // Ids já escolhidos para o tipo, ignorando o campo de quem está perguntando.
  private idsEscolhidos(tipo: TipoPessoa, ignorar: number | 'principal'): number[] {
    const ids: number[] = [];
    const principal = tipo === 'paciente' ? this.idPaciente() : this.idEspecialista();
    if (ignorar !== 'principal' && principal != null) ids.push(principal);

    // Extras só contam em consulta coletiva (fora dela ficam guardados, mas inativos).
    if (this.ehColetiva()) {
      for (const extra of this.extras(tipo)()) {
        if (extra.uid !== ignorar && extra.id != null) ids.push(extra.id);
      }
    }
    return ids;
  }

  private cacheOpcoes = new Map<
    string,
    { base: OpcaoSelectBusca[]; chave: string; lista: OpcaoSelectBusca[] }
  >();

  // Opções de um select, sem as pessoas já escolhidas nos OUTROS campos do mesmo tipo.
  // Devolve a MESMA referência enquanto nada mudou: o SelectBusca reseta o texto digitado
  // sempre que recebe um array novo em [opcoes].
  opcoesDisponiveis(tipo: TipoPessoa, uid: number | 'principal'): OpcaoSelectBusca[] {
    const base = tipo === 'paciente' ? this.opcoesPacientes() : this.opcoesEspecialistas();
    const usados = this.idsEscolhidos(tipo, uid);
    if (usados.length === 0) return base;

    const chave = usados.join(',');
    const chaveCache = `${tipo}:${uid}`;
    const guardado = this.cacheOpcoes.get(chaveCache);
    if (guardado && guardado.base === base && guardado.chave === chave) return guardado.lista;

    const lista = base.filter((o) => !usados.includes(o.id as number));
    this.cacheOpcoes.set(chaveCache, { base, chave, lista });
    return lista;
  }

  // ---------- validação ----------

  private validar(): boolean {
    const OBRIGATORIO = 'Campo obrigatório.';
    const e: Record<string, string> = {};

    if (this.idPaciente() == null) e['paciente'] = OBRIGATORIO;
    if (this.idEspecialista() == null) e['especialista'] = OBRIGATORIO;
    if (!this.modalidade()) e['modalidade'] = OBRIGATORIO;
    if (!this.data()) e['data'] = OBRIGATORIO;
    if (!this.horaInicio()) e['horaInicio'] = OBRIGATORIO;

    if (!this.horaTermino()) {
      e['horaTermino'] = OBRIGATORIO;
    } else if (this.horaInicio() && this.horaTermino() <= this.horaInicio()) {
      e['horaTermino'] = 'O término deve ser depois do início.';
    }

    // Campo extra aberto e vazio: ou escolhe a pessoa, ou remove o campo.
    if (this.ehColetiva()) {
      for (const tipo of ['paciente', 'especialista'] as const) {
        for (const extra of this.extras(tipo)()) {
          if (extra.id == null) e[`${tipo}-${extra.uid}`] = 'Selecione a pessoa ou remova este campo.';
        }
      }
    }

    this.erros.set(e);
    return Object.keys(e).length === 0;
  }

  // ---------- salvar ----------

  private idsAdicionais(tipo: TipoPessoa): number[] {
    return this.extras(tipo)().map((x) => x.id as number);
  }

  salvarConsulta() {
    if (this.salvando()) return;

    this.erro.set('');
    if (!this.validar()) {
      this.finalizarComErro('Preencha os campos obrigatórios destacados em vermelho.');
      return;
    }

    this.salvando.set(true);

    const dados: NovaTerapia = {
      idPaciente: this.idPaciente()!,
      idEspecialista: this.idEspecialista()!,
      modalidade: this.modalidade() as Modalidade,
      dataHoraInicio: `${this.data()}T${this.horaInicio()}:00`,
      dataHoraFim: `${this.data()}T${this.horaTermino()}:00`,
    };

    if (this.ehColetiva()) {
      dados.idsPacientesAdicionais = this.idsAdicionais('paciente');
      dados.idsEspecialistasAdicionais = this.idsAdicionais('especialista');
    }

    this.terapiaService.criar(dados).subscribe({
      next: () => {
        this.salvando.set(false);
        this.dialogSucessoAberto.set(true);
      },
      error: (err: HttpErrorResponse) => this.tratarErroApi(err),
    });
  }

  private tratarErroApi(err: HttpErrorResponse) {
    const novos: Record<string, string> = {};
    const { mensagemGeral } = aplicarErrosApi(
      err,
      (chave, mensagem) => {
        const destino = CAMPOS_API[campoDaChave(chave)];
        if (destino) novos[destino] = mensagem;
        return !!destino;
      },
      { padrao: 'Erro ao salvar a consulta.' }
    );

    if (Object.keys(novos).length) this.erros.update((e) => ({ ...e, ...novos }));
    this.finalizarComErro(mensagemGeral);
  }

  private finalizarComErro(mensagem: string) {
    this.salvando.set(false);
    this.erro.set(mensagem);
    setTimeout(() => {
      document.querySelector('.input-erro, .erro-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  // ---------- diálogo de sucesso ----------

  private limparFormulario() {
    this.idPaciente.set(null);
    this.idEspecialista.set(null);
    this.modalidade.set('');
    this.data.set('');
    this.horaInicio.set('');
    this.horaTermino.set('');
    this.pacientesExtras.set([]);
    this.especialistasExtras.set([]);
    this.cacheOpcoes.clear();
    this.erros.set({});
    this.erro.set('');
  }

  aoCriarOutra() {
    this.dialogSucessoAberto.set(false);
    this.limparFormulario();
  }

  aoVoltarInicio() {
    this.dialogSucessoAberto.set(false);
    this.router.navigateByUrl('/administrador');
  }
}