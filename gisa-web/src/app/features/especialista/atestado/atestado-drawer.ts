import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Paciente } from '../../../core/models/paciente.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { CidService } from '../../../core/services/cid';
import { EspecialistaLogadoService, PerfilEspecialista } from '../../../core/services/especialista-logado';
import { ComErros } from '../../../shared/components/com-erros';
import { OpcaoSelectBusca, SelectBusca } from '../../../shared/components/select-busca/select-busca';
import { dataCurta, dataExtenso, hojeIso, idadeEmAnos } from '../../../shared/utils/data.util';
import { formatarCpf } from '../../../shared/utils/formatacao.util';
import { formatarMatricula } from '../agenda/agenda.util';
import { AtestadoFolha, DadosFolhaAtestado } from './atestado-folha';
import {
  FormAtestado,
  ROTULO_TIPO_ATESTADO,
  TipoAtestado,
  calcularDataFim,
  calcularDias,
  textoAtestado,
  tipoTemPeriodo,
  validarAtestado,
} from './atestado.util';

// Máximo de CIDs listados de uma vez no autocompletar (a lista local é grande).
const LIMITE_OPCOES_CID = 50;

function formularioVazio(): FormAtestado {
  return {
    tipo: '',
    dias: null,
    dataInicio: hojeIso(),
    dataFim: '',
    codigoCid: null,
    autorizouCid: false,
    cpfResponsavel: '',
    observacoes: '',
  };
}

// Emissão de atestado (RF12 / CS09) em drawer lateral, aberto a partir do prontuário.
// A API NÃO guarda atestados: o documento só é montado aqui, visualizado no timbrado e
// impresso / salvo em PDF pelo navegador. Nada é enviado ao servidor.
@Component({
  selector: 'app-atestado-drawer',
  imports: [FormsModule, SelectBusca, AtestadoFolha],
  templateUrl: './atestado-drawer.html',
  styleUrl: './atestado-drawer.scss',
})
export class AtestadoDrawer extends ComErros {
  private perfilService = inject(EspecialistaLogadoService);
  private cidService = inject(CidService);

  private _aberto = false;

  @Input() set aberto(valor: boolean) {
    if (valor && !this._aberto) this.aoAbrir();
    this._aberto = valor;
  }
  get aberto(): boolean {
    return this._aberto;
  }

  @Input({ required: true }) paciente!: Paciente;
  @Output() fechar = new EventEmitter<void>();

  readonly tipos = (Object.keys(ROTULO_TIPO_ATESTADO) as TipoAtestado[]).map((valor) => ({
    valor,
    label: ROTULO_TIPO_ATESTADO[valor],
  }));
  readonly limiteCid = LIMITE_OPCOES_CID;
  readonly cpf = formatarCpf;
  readonly dataCurta = dataCurta;
  readonly matricula = formatarMatricula;
  readonly temPeriodo = tipoTemPeriodo;
  hoje = hojeIso();

  // Opções do autocompletar de CID (lista local do projeto; ver CidService).
  readonly opcoesCid: OpcaoSelectBusca[] = this.cidService.sugestoes().map((c) => ({
    id: c.codigoCID,
    label: `${c.codigoCID} — ${c.descricao}`,
  }));

  form: FormAtestado = formularioVazio();

  perfil = signal<PerfilEspecialista | null>(null);
  erroPerfil = signal('');
  previa = signal(false);

  get idade(): string {
    return `${idadeEmAnos(this.paciente.pessoa.dataNascimento)} anos`;
  }

  get responsaveis() {
    return this.paciente.responsaveis.map((v) => v.responsavel);
  }

  get cidSelecionado(): string | null {
    const codigo = this.form.codigoCid;
    if (!codigo) return null;
    const achado = this.cidService.sugestoes().find((c) => c.codigoCID === codigo);
    return achado ? `${achado.codigoCID} — ${achado.descricao}` : codigo;
  }

  // Dados da folha, montados a cada abertura da prévia.
  folha = computed<DadosFolhaAtestado | null>(() => {
    const perfil = this.perfil();
    if (!this.previa() || !perfil) return null;
    return this.montarFolha(perfil);
  });

  private aoAbrir() {
    this.form = formularioVazio();
    this.erros = {};
    this.previa.set(false);
    this.hoje = hojeIso();
    this.erroPerfil.set('');
    // O cabeçalho do atestado vem do cadastro do especialista logado.
    this.perfilService.perfil().subscribe({
      next: (p) => this.perfil.set(p),
      error: (err) => this.erroPerfil.set(mensagemDeErro(err, 'Não foi possível carregar os dados do emitente.')),
    });
  }

  // ---- reações do formulário ----
  aoTrocarTipo() {
    this.limparErro('tipo');
    if (this.form.tipo === 'ACOMPANHAMENTO' && !this.form.cpfResponsavel) {
      this.form.cpfResponsavel = this.responsaveis[0]?.cpf ?? '';
    }
    if (tipoTemPeriodo(this.form.tipo)) this.recalcularFim();
  }

  // Mudou a quantidade de dias ou o início: a data final acompanha.
  aoMudarDias() {
    this.limparErro('dias');
    this.limparErro('dataFim');
    this.recalcularFim();
  }

  aoMudarInicio() {
    this.limparErro('dataInicio');
    this.limparErro('dataFim');
    this.recalcularFim();
  }

  // Mudou a data final: a quantidade de dias acompanha.
  aoMudarFim() {
    this.limparErro('dataFim');
    this.limparErro('dias');
    const dias = calcularDias(this.form.dataInicio, this.form.dataFim);
    if (dias !== null) this.form.dias = dias;
  }

  private recalcularFim() {
    if (!tipoTemPeriodo(this.form.tipo)) return;
    this.form.dataFim = calcularDataFim(this.form.dataInicio, this.form.dias);
  }

  aoEscolherCid(codigo: number | string | null) {
    this.form.codigoCid = codigo === null ? null : String(codigo);
    if (!this.form.codigoCid) this.form.autorizouCid = false;
    this.limparErro('autorizouCid');
  }

  // ---- ações ----
  gerarPrevia() {
    this.erros = validarAtestado(this.form);
    if (Object.keys(this.erros).length > 0) return;
    this.previa.set(true);
  }

  fecharPrevia() {
    this.previa.set(false);
  }

  // O navegador oferece "Salvar como PDF" na janela de impressão.
  imprimir() {
    window.print();
  }

  aoFechar() {
    this.previa.set(false);
    this.fechar.emit();
  }

  private montarFolha(perfil: PerfilEspecialista): DadosFolhaAtestado {
    const responsavel = this.responsaveis.find((r) => r.cpf === this.form.cpfResponsavel) ?? null;
    return {
      paragrafos: textoAtestado({
        form: this.form,
        pacienteNome: this.paciente.pessoa.nome,
        pacienteCpf: this.paciente.pessoa.cpf,
        responsavel: responsavel ? { nome: responsavel.nome, cpf: responsavel.cpf } : null,
        cidTexto: this.form.codigoCid && this.form.autorizouCid ? this.cidSelecionado : null,
      }),
      localData: `Sorocaba, ${dataExtenso(hojeIso()).replace(/^[^,]+, /, '')}.`,
      emitente: {
        nome: perfil.nome,
        especialidade: perfil.especialidades.join(', '),
        registro: perfil.registroConselho ?? '',
        cbo: perfil.cbo ?? '',
      },
    };
  }
}
