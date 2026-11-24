import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  DialogoEnderecoCompartilhado,
  EnderecoCompartilhadoItem,
} from '../../../shared/components/dialogo-endereco-compartilhado/dialogo-endereco-compartilhado';
import {
  DialogoResidenciaOutrosPacientes,
  ResidenciaOutrosPacientesItem,
} from '../../../shared/components/dialogo-residencia-outros-pacientes/dialogo-residencia-outros-pacientes';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { ListaEnderecos } from '../../../shared/components/lista-enderecos/lista-enderecos';
import { SelectMenu } from '../../../shared/components/select-menu/select-menu';

// Formulários reaproveitados do cadastro
import { InfoPaciente } from '../cadastrar-paciente/formularios/info-paciente/info-paciente';
import { InfoResponsavel } from '../cadastrar-paciente/formularios/info-responsavel/info-responsavel';
import { InfoEscola } from '../cadastrar-paciente/formularios/info-escola/info-escola';
import { InfoProntuario } from '../cadastrar-paciente/formularios/info-prontuario/info-prontuario';
import { InfoCid } from '../cadastrar-paciente/formularios/info-cid/info-cid';
import { QuemMoraAqui } from '../cadastrar-paciente/formularios/quem-mora-aqui/quem-mora-aqui';
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
import { ProfissionalService } from '../../../core/services/profissional';
import { Auth } from '../../../core/auth/auth';
import { aplicarErrosApi, lerErroApi, mensagemDeErro } from '../../../core/http/erro-api';
import { lerContextoPacientes } from '../contexto-pacientes';
import {
  ajustarResidencia,
  dadosPessoaisDe,
  enderecoEmTexto,
  enderecoParaForm,
  mesmoEnderecoForm,
  responsavelParaForm,
} from '../paciente-form.util';
import { soDigitos, vazio } from '../../../shared/utils/texto.util';
import { AssistentesSociaisEdicao } from './assistentes-sociais-edicao/assistentes-sociais-edicao';

@Component({
  selector: 'app-editar-paciente',
  imports: [
    FormsModule,
    SelectMenu,
    CabecalhoPagina,
    ConfirmDialog,
    DialogoEnderecoCompartilhado,
    DialogoResidenciaOutrosPacientes,
    DadosPessoais,
    ListaEnderecos,
    InfoPaciente,
    InfoResponsavel,
    InfoEscola,
    InfoProntuario,
    InfoCid,
    QuemMoraAqui,
    AssistentesSociaisEdicao,
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
  private profissionalService = inject(ProfissionalService);
  private auth = inject(Auth);
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
  @ViewChild(AssistentesSociaisEdicao) assistentesForm?: AssistentesSociaisEdicao;

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
  // Vínculos com assistentes sociais: as rotas são do assistente social (EDITAR_PROFISSIONAL).
  podeVincular = this.auth.temPermissao('EDITAR_PROFISSIONAL');

  // 409 do PATCH: endereços alterados que também são de outros cadastros (o diálogo pergunta um a um).
  enderecosCompartilhados = signal<EnderecoCompartilhadoItem[]>([]);
  // 409: responsável que passa a residir e ainda mora com outros pacientes (o diálogo pergunta um a um).
  residenciasOutros = signal<ResidenciaOutrosPacientesItem[]>([]);

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
  assistentesIniciais = computed(() => this.paciente()?.assistentesSociais ?? []);
  cidsIniciais = computed<Cid[]>(() => this.paciente()?.cids ?? []);
  escolaInicial = computed<Escola | null>(() => this.paciente()?.escola ?? null);
  responsaveisIniciais = computed<ResponsavelItem[]>(() => {
    const p = this.paciente();
    return p ? p.responsaveis.map((v) => responsavelParaForm(v)) : [];
  });

  // ---- "Quem mora aqui" nos cards de endereço ----
  // Mesma referência enquanto os residentes não mudam: um array novo a cada verificação dispararia o NG0100.
  private residentesAtuais: ResponsavelItem[] = [];
  residentes(info: InfoResponsavel): ResponsavelItem[] {
    const atual = info.listaResponsaveis.filter((r) => !r.naoResideComPaciente);
    const igual = atual.length === this.residentesAtuais.length && atual.every((r, i) => r === this.residentesAtuais[i]);
    if (!igual) this.residentesAtuais = atual;
    return this.residentesAtuais;
  }

  mostrarMoradores(info: InfoResponsavel, lista: ListaEnderecos): boolean {
    return lista.itens.length >= 2 && this.residentes(info).length > 0;
  }

  ajustarMoradores(info: InfoResponsavel, lista: ListaEnderecos) {
    ajustarResidencia(info.listaResponsaveis, lista.itens);
  }

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

    // Quem reside acompanha o paciente (D2); quem não se mudou já foi marcado como "não reside" no card.
    await this.salvar(f, original);
  }

  // Respostas do diálogo da residência ficam nos itens dos responsáveis; salvar de novo refaz o fluxo.
  async confirmarResidenciasOutros(decisoes: Map<number, boolean>) {
    this.residenciasOutros.set([]);
    for (const item of this.infoResponsavelForm?.listaResponsaveis ?? []) {
      if (item.idResponsavel != null && decisoes.has(item.idResponsavel)) {
        item.continuaComOutrosPacientes = decisoes.get(item.idResponsavel);
      }
    }
    await this.salvarEdicao();
  }

  // Respostas do diálogo ficam nos itens da lista; salvar de novo refaz o fluxo (sem vincular de novo).
  async confirmarEnderecosCompartilhados(decisoes: Map<number, boolean>) {
    this.enderecosCompartilhados.set([]);
    this.enderecosForm?.aplicarDecisoes(decisoes);
    await this.salvarEdicao();
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
      await this.adicionarResponsaveisNovos(f, this.enderecoMuda(f, original));
      const atualizado = await firstValueFrom(
        this.pacienteService.atualizar(this.id(), this.montarAtualizacao(f, original, escola))
      );
      // Depois do paciente: quem deixou de residir só sai do endereço do paciente neste PATCH, e antes
      // disso a API recusa o endereço próprio dele ("também é de um paciente").
      const falhas = await this.atualizarResponsaveisExistentes(f, original);
      const falhasVinculos = await this.sincronizarAssistentesSociais();
      this.paciente.set(atualizado);
      const avisos = [
        falhas ? `não foi possível atualizar o responsável ${falhas}` : '',
        falhasVinculos ? `não foi possível atualizar o vínculo com ${falhasVinculos}` : '',
      ].filter(Boolean);
      if (avisos.length) {
        this.erroGeral.set(`Paciente salvo, mas ${avisos.join('; ')}`);
        return;
      }
      this.nomeSalvo.set(atualizado.pessoa.nome);
      this.mostrarSucesso();
    } catch (e) {
      const residencias = lerErroApi(e)?.residenciasEmOutrosPacientes;
      if (residencias?.length) {
        this.residenciasOutros.set(residencias.map((r) => ({
          ...r,
          nome: f.infoResponsavel.listaResponsaveis.find((i) => i.idResponsavel === r.idResponsavel)?.nome.trim()
            ?? `Responsável ${r.idResponsavel}`,
        })));
        return; // abre o diálogo
      }
      // Os passos de escola e responsáveis já preenchem erroGeral; aqui chegam os do paciente.
      if (this.erroGeral()) return;
      const compartilhados = lerErroApi(e)?.enderecosCompartilhados;
      if (compartilhados?.length) {
        this.enderecosCompartilhados.set(compartilhados.map((c) => {
          const item = f.enderecos.itens.find((i) => i.idEndereco === c.idEndereco);
          return { ...c, texto: item ? enderecoEmTexto(item) : `Endereço ${c.idEndereco}` };
        }));
        return; // abre o diálogo
      }
      this.erroGeral.set(this.errosApi.tratar(e, f).mensagemGeral);
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

  private async adicionarResponsaveisNovos(f: FormulariosPaciente, enderecoMuda: boolean) {
    for (const item of f.infoResponsavel.listaResponsaveis) {
      // Já vinculado (ou vinculado numa tentativa anterior deste salvamento).
      if (item.idResponsavel && !item.reaproveitado) continue;
      try {
        // Esta rota usa os IDs dos endereços atuais do paciente, não os índices do POST /pacientes.
        // Se os endereços mudam neste salvamento, o vínculo nasce como "não reside" e o PATCH seguinte,
        // já com a lista nova, marca a residência (os IDs atuais podem deixar de existir).
        // Lista sem mudança: todos os itens já têm idEndereco; vão os dos endereços em que ele mora.
        const ids = f.enderecos.itens
          .filter((e) => item.residencia.includes(e.chave) && e.idEndereco != null)
          .map((e) => e.idEndereco!);
        const dados: ResponsavelPayload = {
          ...this.payload.montarResponsavel(item, []),
          indicesEnderecoResidencia: undefined,
          idsEnderecoResidencia: enderecoMuda || item.naoResideComPaciente ? [] : ids,
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
        // A pergunta da residência não é erro do responsável: o diálogo abre e o salvamento é refeito.
        if (lerErroApi(e)?.residenciasEmOutrosPacientes?.length) throw e;
        this.marcarErroResponsavel(f, item, e);
        throw e;
      }
    }
  }

  // O endereço de quem reside com o paciente a API acerta no PATCH do paciente; aqui só muda o de quem
  // não reside (correção manual no cadastro do responsável).
  // Devolve '' ou as falhas ("Nome: motivo"): o paciente já foi salvo, então uma falha aqui não desfaz nada.
  private async atualizarResponsaveisExistentes(f: FormulariosPaciente, original: Paciente): Promise<string> {
    const falhas: string[] = [];
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
      // Os dois lados passam pela mesma montagem (sem idEndereco, CEP só com dígitos, complemento vazio
      // ausente): diferença só de formato, como complemento "" vindo da API, não conta como alteração.
      // Enviar sem mudança faz a API procurar a linha pela chave e pode responder um 409 indevido.
      // Compara com todos os endereços atuais dele: igual a qualquer um, nada mudou (quem deixou de residir
      // continua no endereço antigo pelo PATCH do paciente).
      const atuais = r.enderecos.map((e) => JSON.stringify(this.payload.montarEndereco(enderecoParaForm(e))));
      if (endereco && !atuais.includes(JSON.stringify(endereco))) dados.enderecos = [endereco];
      if (Object.keys(dados).length === 0) continue;

      try {
        await firstValueFrom(this.responsavelService.atualizar(r.idCadastro, dados));
      } catch (e) {
        falhas.push(this.textoErroResponsavel(item, e));
      }
    }
    return falhas.join(' ');
  }

  // Vínculos com assistentes sociais: depois do PATCH (Cancelar descarta tudo). Rotas do assistente social
  // (EDITAR_PROFISSIONAL). Devolve '' ou as falhas ("Nome (vincular): motivo"); o que deu certo fica gravado.
  private async sincronizarAssistentesSociais(): Promise<string> {
    const form = this.assistentesForm;
    if (!form || !this.podeVincular) return '';
    const falhas: string[] = [];
    for (const id of form.novos()) {
      try {
        await firstValueFrom(this.profissionalService.vincularPaciente(id, this.id()));
        form.marcarSalvo(id, true);
      } catch (e) {
        falhas.push(`${form.nome(id)} (vincular): ${mensagemDeErro(e, 'erro ao vincular')}`);
      }
    }
    for (const id of form.removidos()) {
      try {
        await firstValueFrom(this.profissionalService.desvincularPaciente(id, this.id()));
        form.marcarSalvo(id, false);
      } catch (e) {
        falhas.push(`${form.nome(id)} (desvincular): ${mensagemDeErro(e, 'erro ao desvincular')}`);
      }
    }
    return falhas.join(' ');
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
      // Quem saiu da lista é desvinculado pela API. Cada um mora nos endereços marcados em "Quem mora aqui".
      responsaveis: f.infoResponsavel.listaResponsaveis
        .filter((r) => r.idResponsavel)
        .map((r) => ({
          idResponsavel: r.idResponsavel!,
          grauParentesco: r.grauParentesco as GrauParentesco,
          indicesEnderecoResidencia: this.payload.indicesResidencia(r, f.enderecos.itens),
          continuaComOutrosPacientes: r.continuaComOutrosPacientes,
        })),
    };
  }

  // Erros dos responsáveis aparecem na lista de responsáveis, com o nome de quem falhou.
  private marcarErroResponsavel(f: FormulariosPaciente, item: ResponsavelItem, err: unknown) {
    const texto = this.textoErroResponsavel(item, err);
    f.infoResponsavel.erros['responsaveis'] = texto;
    this.erroGeral.set(`Não foi possível salvar o responsável ${texto}`);
  }

  // "Nome: mensagens da API".
  private textoErroResponsavel(item: ResponsavelItem, err: unknown): string {
    const mensagens: string[] = [];
    const r = aplicarErrosApi(err, (_chave, mensagem) => (mensagens.push(mensagem), true));
    return `${item.nome.trim()}: ${mensagens.length ? mensagens.join(' ') : r.mensagemGeral}`;
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
