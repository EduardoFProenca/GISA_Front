import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { ListaEnderecos } from '../../../shared/components/lista-enderecos/lista-enderecos';
import { SelectMenu } from '../../../shared/components/select-menu/select-menu';

// Formulários reaproveitados do cadastro
import { InfoPaciente } from '../cadastrar-paciente/formularios/info-paciente/info-paciente';
import { InfoResponsavel } from '../cadastrar-paciente/formularios/info-responsavel/info-responsavel';
import { InfoEscola } from '../cadastrar-paciente/formularios/info-escola/info-escola';
import { InfoProntuario } from '../cadastrar-paciente/formularios/info-prontuario/info-prontuario';
import { InfoCid } from '../cadastrar-paciente/formularios/info-cid/info-cid';
import { FormulariosPaciente, InfoEscolaForm, ResponsavelItem } from '../cadastrar-paciente/models/formularios-paciente';
import { PacienteValidadorService } from '../cadastrar-paciente/services/paciente-validador';
import { PacienteCadastroPayloadService } from '../cadastrar-paciente/services/paciente-payload';
import { PacienteErrosApiService } from '../cadastrar-paciente/services/paciente-erros-api';

import {
  AtualizacaoPacientePayload,
  AtualizacaoResponsavelPayload,
  GrauParentesco,
  Paciente,
  ResponsavelPayload,
  StatusPaciente,
} from '../../../core/models/paciente.model';
import { EstadoCivil } from '../../../core/models/comum.model';
import { Cid } from '../../../core/models/cid.model';
import { Escola } from '../../../core/models/escola.model';
import { PacienteService } from '../../../core/services/paciente';
import { ResponsavelService } from '../../../core/services/responsavel';
import { EscolaService } from '../../../core/services/escola';
import { aplicarErrosApi, lerErroApi, mensagemDeErro } from '../../../core/http/erro-api';
import { lerContextoPacientes } from '../contexto-pacientes';
import { dadosPessoaisDe, enderecoParaForm, mesmoEnderecoForm, responsavelParaForm } from '../paciente-form.util';
import { soDigitos, vazio } from '../../../shared/utils/texto.util';

@Component({
  selector: 'app-editar-paciente',
  imports: [
    FormsModule,
    SelectMenu,
    CabecalhoPagina,
    ConfirmDialog,
    DadosPessoais,
    ListaEnderecos,
    InfoPaciente,
    InfoResponsavel,
    InfoEscola,
    InfoProntuario,
    InfoCid
  ],
  templateUrl: './editar-paciente.html',
  styleUrl: './editar-paciente.scss'
})
export class EditarPaciente implements OnInit {
  private avisoSucesso = inject(AvisoSucessoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private pacienteService = inject(PacienteService);
  private responsavelService = inject(ResponsavelService);
  private escolaService = inject(EscolaService);
  private validador = inject(PacienteValidadorService);
  private payload = inject(PacienteCadastroPayloadService);
  private errosApi = inject(PacienteErrosApiService);

  // Os formulários filhos só existem depois que o paciente carrega.
  @ViewChild(DadosPessoais) dadosPessoaisForm?: DadosPessoais;
  @ViewChild(ListaEnderecos) enderecosForm?: ListaEnderecos;
  @ViewChild(InfoPaciente) infoPacienteForm?: InfoPaciente;
  @ViewChild(InfoResponsavel) infoResponsavelForm?: InfoResponsavel;
  @ViewChild(InfoEscola) infoEscolaForm?: InfoEscola;
  @ViewChild(InfoProntuario) infoProntuarioForm?: InfoProntuario;
  @ViewChild(InfoCid) infoCidForm?: InfoCid;

  rotaBase = lerContextoPacientes(this.route).rotaBase;
  id = signal(0);

  carregando = signal(true);
  erro = signal('');
  erroGeral = signal('');
  paciente = signal<Paciente | null>(null);
  status = signal<StatusPaciente>('MATRICULADO');
  salvando = signal(false);
  nomeSalvo = signal('');
  confirmarCancelamentoAberto = signal(false);

  // Mudança de endereço: pergunta quais responsáveis que residem com o paciente vão junto.
  mudancaAberta = signal(false);
  residentesNaMudanca = signal<{ idResponsavel: number; nome: string; vaiJunto: boolean; item: ResponsavelItem }[]>([]);

  // ---- valores iniciais dos formulários (formatados como o usuário digitaria) ----
  dadosPessoais = computed(() => {
    const p = this.paciente();
    return p ? dadosPessoaisDe(p.pessoa) : {};
  });
  enderecosIniciais = computed(() => this.paciente()?.pessoa.enderecos ?? []);
  convenioInicial = computed(() => this.paciente()?.convenio ?? false);
  prontuarioInicial = computed(() => {
    const pr = this.paciente()?.prontuario;
    return { alergias: pr?.alergias ?? '', comorbidade: pr?.comorbidade ?? '', mobilidade: pr?.mobilidade ?? '' };
  });
  cidsIniciais = computed<Cid[]>(() => this.paciente()?.cids ?? []);
  escolaInicial = computed<Escola | null>(() => this.paciente()?.escola ?? null);
  responsaveisIniciais = computed<ResponsavelItem[]>(() => {
    const p = this.paciente();
    return p ? p.responsaveis.map((v) => responsavelParaForm(v)) : [];
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id.set(Number(params.get('id')));
      this.carregar();
    });
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.paciente.set(null);

    this.pacienteService.buscar(this.id()).subscribe({
      next: (p) => {
        this.paciente.set(p);
        this.status.set(p.statusPaciente);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.status === 404 ? 'Paciente não encontrado.' : 'Não foi possível carregar o paciente.');
        this.carregando.set(false);
      },
    });
  }

  private get formularios(): FormulariosPaciente | null {
    if (
      !this.dadosPessoaisForm || !this.enderecosForm || !this.infoPacienteForm || !this.infoResponsavelForm ||
      !this.infoEscolaForm || !this.infoProntuarioForm || !this.infoCidForm
    ) {
      return null;
    }
    return {
      dadosPessoais: this.dadosPessoaisForm,
      enderecos: this.enderecosForm,
      infoPaciente: this.infoPacienteForm,
      infoResponsavel: this.infoResponsavelForm,
      infoEscola: this.infoEscolaForm,
      infoProntuario: this.infoProntuarioForm,
      infoCid: this.infoCidForm,
    };
  }

  // Salvar = (1) cadastra responsáveis novos, (2) atualiza dados pessoais dos responsáveis
  // existentes que mudaram e (3) faz o PATCH do paciente com a lista final de vínculos.
  async salvarEdicao() {
    const f = this.formularios;
    const original = this.paciente();
    if (!f || !original || this.salvando()) return;

    this.erroGeral.set('');

    if (!this.validador.validar(f).valido) {
      this.erroGeral.set('Preencha os campos obrigatórios destacados em vermelho.');
      setTimeout(() => {
        document.querySelector('.input-erro, .erro-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    // Endereço mudou e há quem reside com o paciente: pergunta quem vai junto antes de salvar.
    const residentes = f.infoResponsavel.listaResponsaveis.filter(
      (r) => r.idResponsavel && r.resideAntes && !r.naoResideComPaciente
    );
    if (this.enderecoMuda(f, original) && residentes.length) {
      this.residentesNaMudanca.set(residentes.map((item) => ({
        idResponsavel: item.idResponsavel!, nome: item.nome.trim(), vaiJunto: true, item,
      })));
      this.mudancaAberta.set(true);
      return;
    }
    await this.salvar(f, original);
  }

  // Quem ficou desmarcado continua no endereço atual e passa a constar como "não reside".
  async confirmarMudanca() {
    const f = this.formularios;
    const original = this.paciente();
    this.mudancaAberta.set(false);
    if (!f || !original) return;
    for (const { vaiJunto, item } of this.residentesNaMudanca()) {
      if (vaiJunto) continue;
      item.naoResideComPaciente = true;
      item.endereco = item.enderecoCadastro ? { ...item.enderecoCadastro } : null;
    }
    await this.salvar(f, original);
  }

  // Qualquer diferença na lista (quantidade, IDs na mesma posição ou valores) conta como mudança.
  private enderecoMuda(f: FormulariosPaciente, original: Paciente): boolean {
    const novos = f.enderecos.itens;
    const atuais = original.pessoa.enderecos;
    return novos.length !== atuais.length || novos.some(
      (n, i) => n.idEndereco !== atuais[i].idEndereco || !mesmoEnderecoForm(n, enderecoParaForm(atuais[i]))
    );
  }

  private async salvar(f: FormulariosPaciente, original: Paciente) {
    if (this.salvando()) return;
    this.salvando.set(true);
    try {
      const escola = await this.resolverEscola(f.infoEscola);
      await this.adicionarResponsaveisNovos(f, original, this.enderecoMuda(f, original));
      await this.atualizarResponsaveisExistentes(f, original);
      const atualizado = await firstValueFrom(
        this.pacienteService.atualizar(this.id(), this.montarAtualizacao(f, original, escola))
      );
      this.paciente.set(atualizado);
      this.nomeSalvo.set(atualizado.pessoa.nome);
      this.mostrarSucesso();
    } catch (e) {
      // Os passos de escola e responsáveis já preenchem erroGeral; aqui chegam os do paciente.
      // 409 de endereço usado por outros cadastros: por enquanto só o aviso (a A5 troca por pergunta).
      if (!this.erroGeral()) {
        this.erroGeral.set(lerErroApi(e)?.enderecosCompartilhados?.length
          ? mensagemDeErro(e, 'Erro ao salvar cadastro.')
          : this.errosApi.tratar(e, f).mensagemGeral);
      }
    } finally {
      this.salvando.set(false);
    }
  }

  // Escola escolhida na lista -> usa o id. Escola nova (digitada) -> cadastra antes de salvar.
  // Campo vazio -> paciente sem escola.
  private async resolverEscola(ie: InfoEscolaForm): Promise<Escola | null> {
    if (ie.escolaSelecionada) return ie.escolaSelecionada;
    if (vazio(ie.nome)) return null;

    try {
      const criada = await firstValueFrom(
        this.escolaService.cadastrar({
          nome: ie.nome.trim(),
          tipoEscola: ie.tipoEscola as 'REGULAR' | 'ESPECIAL',
          telefone: soDigitos(ie.telefone) || undefined,
        })
      );
      ie.escolaSelecionada = criada; // evita duplicar a escola se o salvamento falhar e for repetido
      return criada;
    } catch (e) {
      this.erroGeral.set(this.errosApi.tratarEscola(e, ie));
      throw e;
    }
  }

  private async adicionarResponsaveisNovos(f: FormulariosPaciente, original: Paciente, enderecoMuda: boolean) {
    const idsAtuais = original.pessoa.enderecos.map((e) => e.idEndereco!);
    for (const item of f.infoResponsavel.listaResponsaveis) {
      // Já vinculado (ou vinculado numa tentativa anterior deste salvamento).
      if (item.idResponsavel && !item.reaproveitado) continue;
      try {
        // Esta rota usa os IDs dos endereços atuais do paciente, não os índices do POST /pacientes.
        // Se os endereços mudam neste salvamento, o vínculo nasce como "não reside" e o PATCH seguinte,
        // já com a lista nova, marca a residência (os IDs atuais podem deixar de existir).
        const dados: ResponsavelPayload = {
          ...this.payload.montarResponsavel(item, 0),
          indicesEnderecoResidencia: undefined,
          idsEnderecoResidencia: enderecoMuda || item.naoResideComPaciente ? [] : idsAtuais,
        };
        const p = await firstValueFrom(this.pacienteService.adicionarResponsavel(this.id(), dados));
        // Guarda o id: se um passo seguinte falhar, a nova tentativa não cadastra de novo.
        const cpf = soDigitos(item.cpf);
        item.idResponsavel = p.responsaveis.find((v) => v.responsavel.cpf === cpf)?.responsavel.idCadastro;

        const posVinculo = this.payload.atualizacaoPosVinculo(item);
        item.reaproveitado = false;
        if (posVinculo && item.idResponsavel) {
          await firstValueFrom(this.responsavelService.atualizar(item.idResponsavel, posVinculo));
        }
      } catch (e) {
        this.marcarErroResponsavel(f, item, e);
        throw e;
      }
    }
  }

  // O endereço de quem reside com o paciente a API acerta no PATCH do paciente; aqui só muda o de quem
  // não reside (correção manual no cadastro do responsável).
  private async atualizarResponsaveisExistentes(f: FormulariosPaciente, original: Paciente) {
    for (const item of f.infoResponsavel.listaResponsaveis) {
      const vinculo = original.responsaveis.find((v) => v.responsavel.idCadastro === item.idResponsavel);
      if (!vinculo) continue; // recém-cadastrado neste salvamento

      const r = vinculo.responsavel;
      const endereco = item.naoResideComPaciente && item.endereco ? this.payload.montarEndereco(item.endereco) : null;
      const dados: AtualizacaoResponsavelPayload = {};
      if (item.nome.trim() !== r.nome) dados.nome = item.nome.trim();
      if ((soDigitos(item.celular) || null) !== r.celular) dados.celular = soDigitos(item.celular) || null;
      if ((item.ocupacao.trim() || null) !== vinculo.ocupacao) dados.ocupacao = item.ocupacao.trim() || null;
      if (item.estadoCivil !== r.estadoCivil) dados.estadoCivil = item.estadoCivil as EstadoCivil;
      // Compara sem o idEndereco: o endereço próprio vai sem ID (a API troca o antigo por um novo e não
      // pergunta pelos outros cadastros daquela linha).
      const atual = r.enderecos[0] ? { ...r.enderecos[0], idEndereco: undefined } : undefined;
      if (endereco && JSON.stringify(endereco) !== JSON.stringify(this.semNulos(atual))) dados.enderecos = [endereco];
      if (Object.keys(dados).length === 0) continue;

      try {
        await firstValueFrom(this.responsavelService.atualizar(r.idCadastro, dados));
      } catch (e) {
        this.marcarErroResponsavel(f, item, e);
        throw e;
      }
    }
  }

  private montarAtualizacao(f: FormulariosPaciente, original: Paciente, escola: Escola | null): AtualizacaoPacientePayload {
    const base = this.payload.montar(f, escola?.idEscola);
    const pr = f.infoProntuario;
    return {
      nome: base.nome,
      estadoCivil: base.estadoCivil,
      celular: base.celular ?? null,
      numCNS: base.numCNS ?? null,
      statusPaciente: this.status(),
      convenio: f.infoPaciente.convenio,
      idEscola: escola?.idEscola ?? null,
      // Lista completa: os índices de residência dos responsáveis apontam para ela.
      enderecos: base.enderecos,
      codigosCid: base.codigosCid,
      novosCids: base.novosCids,
      prontuario: {
        alergias: pr.alergias.trim() || null,
        comorbidade: pr.comorbidade.trim() || null,
        mobilidade: pr.mobilidade.trim() || null,
      },
      // Quem saiu da lista é desvinculado pela API. Quem reside fica com todos os endereços do paciente (até a B2).
      responsaveis: f.infoResponsavel.listaResponsaveis
        .filter((r) => r.idResponsavel)
        .map((r) => ({
          idResponsavel: r.idResponsavel!,
          grauParentesco: r.grauParentesco as GrauParentesco,
          indicesEnderecoResidencia: this.payload.indicesResidencia(r, base.enderecos.length),
        })),
    };
  }

  // Erros dos responsáveis aparecem na lista de responsáveis, com o nome de quem falhou.
  private marcarErroResponsavel(f: FormulariosPaciente, item: ResponsavelItem, err: unknown) {
    const mensagens: string[] = [];
    const r = aplicarErrosApi(err, (_chave, mensagem) => (mensagens.push(mensagem), true));
    const texto = `${item.nome.trim()}: ${mensagens.length ? mensagens.join(' ') : r.mensagemGeral}`;
    f.infoResponsavel.erros['responsaveis'] = texto;
    this.erroGeral.set(`Não foi possível salvar o responsável ${texto}`);
  }

  private semNulos<T extends object>(obj: T | undefined): Partial<T> | undefined {
    if (!obj) return undefined;
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>;
  }

  irParaGerenciarPacientes() {
    this.router.navigateByUrl(this.rotaBase);
  }

  irParaDetalhes() {
    this.router.navigateByUrl(`${this.rotaBase}/${this.id()}`);
  }

  cancelar() {
    this.confirmarCancelamentoAberto.set(true);
  }

  confirmarCancelamento() {
    this.confirmarCancelamentoAberto.set(false);
    this.location.back();
  }

  // Aviso de sucesso com os próximos passos (fim de fluxo).
  private mostrarSucesso() {
    this.avisoSucesso.mostrar({
      titulo: 'Alterações salvas',
      detalhe: this.nomeSalvo(),
      acoes: [
        { texto: 'Voltar à lista', acao: () => this.irParaGerenciarPacientes() },
        { texto: 'Ver paciente', primaria: true, acao: () => this.irParaDetalhes() },
      ],
    });
  }
}
