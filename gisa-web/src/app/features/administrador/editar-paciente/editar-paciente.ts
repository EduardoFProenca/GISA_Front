import { ChangeDetectorRef, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// Componentes Compartilhados
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';

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

import { GrauParentesco, StatusPaciente } from '../../../core/models/paciente.model';
import { Cid } from '../../../core/models/cid.model';
import { Escola } from '../../../core/models/escola.model';
import { PacienteDetalhe, PacienteEdicaoPayload } from '../../../core/models/paciente-detalhe.model';
import { PacienteService } from '../../../services/paciente';
import { EscolaService } from '../../../services/escola';
import { formatarCelular, formatarCep, formatarCpf } from '../../../shared/utils/formatacao.util';
import { soDigitos, vazio } from '../../../shared/utils/texto.util';

@Component({
  selector: 'app-editar-paciente',
  imports: [
    FormsModule,
    CabecalhoPagina,
    ConfirmDialog,
    SucessoDialog,
    DadosPessoais,
    Contato,
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private pacienteService = inject(PacienteService);
  private escolaService = inject(EscolaService);
  private validador = inject(PacienteValidadorService);
  private payload = inject(PacienteCadastroPayloadService);
  private errosApi = inject(PacienteErrosApiService);

  // Os formulários filhos só existem depois que o paciente carrega.
  @ViewChild(DadosPessoais) dadosPessoaisForm?: DadosPessoais;
  @ViewChild(Contato) contatoForm?: Contato;
  @ViewChild(InfoPaciente) infoPacienteForm?: InfoPaciente;
  @ViewChild(InfoResponsavel) infoResponsavelForm?: InfoResponsavel;
  @ViewChild(InfoEscola) infoEscolaForm?: InfoEscola;
  @ViewChild(InfoProntuario) infoProntuarioForm?: InfoProntuario;
  @ViewChild(InfoCid) infoCidForm?: InfoCid;

  id = signal(this.route.snapshot.paramMap.get('id') ?? '');

  // Signals: respostas assíncronas (carregar/salvar) só atualizam a tela se o template ler signals.
  carregando = signal(true);
  erro = signal('');
  erroGeral = signal('');
  paciente = signal<PacienteDetalhe | null>(null);
  status = signal<StatusPaciente>('MATRICULADO');
  salvando = signal(false);
  dialogSucessoAberto = signal(false);
  nomeSalvo = signal('');

  confirmarCancelamentoAberto = false;

  // ---- valores iniciais dos formulários (formatados como o usuário digitaria) ----
  dadosPessoais = computed(() => {
    const p = this.paciente();
    if (!p) return {};
    return {
      nome: p.nome,
      cpf: formatarCpf(p.cpf),
      email: '',
      dataNascimento: p.dataNascimento,
      sexo: p.sexo,
      celular: formatarCelular(p.celular),
      estadoCivil: p.estadoCivil,
      numCNS: p.numCNS ?? '',
    };
  });

  contato = computed(() => {
    const p = this.paciente();
    return p ? { ...p.endereco, cep: formatarCep(p.endereco.cep) } : {};
  });

  convenioInicial = computed(() => this.paciente()?.convenio ?? false);
  prontuarioInicial = computed(() => this.paciente()?.prontuario);
  cidsIniciais = computed<Cid[]>(() => this.paciente()?.cids ?? []);

  escolaInicial = computed<Escola | null>(() => {
    const e = this.paciente()?.escola;
    return e ? { idEscola: e.idEscola, nome: e.nome, tipoEscola: e.tipoEscola, telefone: e.telefone } : null;
  });

  responsaveisIniciais = computed<ResponsavelItem[]>(() =>
    (this.paciente()?.responsaveis ?? []).map((r) => ({
      nome: r.nome,
      cpf: formatarCpf(r.cpf),
      dataNascimento: r.dataNascimento,
      sexo: r.sexo,
      estadoCivil: r.estadoCivil,
      celular: formatarCelular(r.celular),
      ocupacao: r.ocupacao,
      grauParentesco: r.grauParentesco,
      naoResideComPaciente: r.naoResideComPaciente,
      endereco: r.endereco ? { ...r.endereco, cep: formatarCep(r.endereco.cep) } : null,
    }))
  );

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id.set(params.get('id') ?? '');
      this.carregar();
    });
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.paciente.set(null);

    // Com environment.usarDadosExemplo = true vem de core/data/pacientes-exemplo.ts.
    this.pacienteService.buscarPorId(Number(this.id())).subscribe({
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
      !this.dadosPessoaisForm || !this.contatoForm || !this.infoPacienteForm || !this.infoResponsavelForm ||
      !this.infoEscolaForm || !this.infoProntuarioForm || !this.infoCidForm
    ) {
      return null;
    }
    return {
      dadosPessoais: this.dadosPessoaisForm,
      contato: this.contatoForm,
      infoPaciente: this.infoPacienteForm,
      infoResponsavel: this.infoResponsavelForm,
      infoEscola: this.infoEscolaForm,
      infoProntuario: this.infoProntuarioForm,
      infoCid: this.infoCidForm,
    };
  }

  async salvarEdicao() {
    const f = this.formularios;
    const original = this.paciente();
    if (!f || !original || this.salvando()) return;

    this.erroGeral.set('');

    if (!this.validador.validar(f).valido) {
      this.erroGeral.set('Preencha os campos obrigatórios destacados em vermelho.');
      this.cdr.markForCheck();
      setTimeout(() => {
        document.querySelector('.input-erro, .erro-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    this.salvando.set(true);

    let escola: Escola | null;
    try {
      escola = await this.resolverEscola(f.infoEscola);
    } catch (e) {
      this.salvando.set(false);
      this.erroGeral.set(
        e && typeof e === 'object' && 'status' in e
          ? this.errosApi.tratarEscola(e as never, f.infoEscola)
          : 'Não foi possível cadastrar a escola.'
      );
      return;
    }

    const base = this.payload.montar(f, escola?.idEscola);
    const dados: PacienteEdicaoPayload = {
      nome: base.nome,
      estadoCivil: base.estadoCivil,
      celular: base.celular,
      numCNS: base.numCNS,
      enderecos: base.enderecos,
      convenio: base.convenio,
      codigosCid: base.codigosCid,
      novosCids: base.novosCids,
      prontuario: base.prontuario,
      responsaveis: base.responsaveis,
      idEscola: escola?.idEscola ?? null,
      statusPaciente: this.status(),
    };

    this.pacienteService.editar(Number(this.id()), dados, this.montarVisao(original, f, escola)).subscribe({
      next: () => {
        this.nomeSalvo.set(f.dadosPessoais.nome.trim());
        this.salvando.set(false);
        this.dialogSucessoAberto.set(true);
      },
      error: (err) => {
        const resultado = this.errosApi.tratar(err, f);
        this.salvando.set(false);
        this.erroGeral.set(resultado.mensagemGeral);
      },
    });
  }

  // Escola escolhida na lista -> usa o id. Escola nova (digitada) -> cadastra antes de salvar.
  // Campo vazio -> paciente sem escola.
  private async resolverEscola(ie: InfoEscolaForm): Promise<Escola | null> {
    if (ie.escolaSelecionada) return ie.escolaSelecionada;
    if (vazio(ie.nome)) return null;

    // Com os exemplos ligados nada é gravado na API: a escola nova só existe na ficha em memória.
    if (this.pacienteService.modoExemplo) {
      const local: Escola = {
        idEscola: Date.now(),
        nome: ie.nome.trim(),
        tipoEscola: ie.tipoEscola as 'PUBLICA' | 'PARTICULAR',
        telefone: soDigitos(ie.telefone) || null,
      };
      ie.escolaSelecionada = local;
      return local;
    }

    const criada = await firstValueFrom(
      this.escolaService.cadastrar({
        nome: ie.nome.trim(),
        tipoEscola: ie.tipoEscola as 'PUBLICA' | 'PARTICULAR',
        telefone: soDigitos(ie.telefone) || undefined,
      })
    );
    ie.escolaSelecionada = criada; // evita duplicar a escola se o salvamento falhar e for repetido
    return criada;
  }

  // Ficha como ficará depois da edição (usada para atualizar os exemplos em memória).
  private montarVisao(original: PacienteDetalhe, f: FormulariosPaciente, escola: Escola | null): PacienteDetalhe {
    const dp = f.dadosPessoais;
    const ct = f.contato;
    const pr = f.infoProntuario;

    return {
      idCadastro: original.idCadastro,
      nome: dp.nome.trim(),
      cpf: original.cpf,
      dataNascimento: original.dataNascimento,
      sexo: original.sexo,
      estadoCivil: dp.estadoCivil,
      celular: soDigitos(dp.celular) || null,
      numCNS: soDigitos(dp.numCNS) || null,
      statusPaciente: this.status(),
      convenio: f.infoPaciente.convenio,
      endereco: {
        cep: soDigitos(ct.cep),
        endereco: ct.endereco.trim(),
        numero: ct.numero.trim(),
        complemento: ct.complemento?.trim() ?? '',
        bairro: ct.bairro.trim(),
        cidade: ct.cidade.trim(),
        uf: ct.uf,
      },
      escola: escola
        ? { idEscola: escola.idEscola, nome: escola.nome, tipoEscola: escola.tipoEscola, telefone: escola.telefone ?? null }
        : null,
      responsaveis: f.infoResponsavel.listaResponsaveis.map((r) => ({
        nome: r.nome.trim(),
        cpf: soDigitos(r.cpf),
        celular: soDigitos(r.celular) || null,
        grauParentesco: r.grauParentesco as GrauParentesco,
        dataNascimento: r.dataNascimento,
        sexo: r.sexo,
        estadoCivil: r.estadoCivil,
        ocupacao: r.ocupacao.trim(),
        naoResideComPaciente: r.naoResideComPaciente,
        endereco:
          r.naoResideComPaciente && r.endereco
            ? {
                cep: soDigitos(r.endereco.cep),
                endereco: r.endereco.endereco.trim(),
                numero: r.endereco.numero.trim(),
                complemento: r.endereco.complemento?.trim() ?? '',
                bairro: r.endereco.bairro.trim(),
                cidade: r.endereco.cidade.trim(),
                uf: r.endereco.uf,
              }
            : null,
      })),
      prontuario: { alergias: pr.alergias.trim(), comorbidade: pr.comorbidade.trim(), mobilidade: pr.mobilidade.trim() },
      cids: f.infoCid.listaCids().map((c) => ({ codigoCID: c.codigoCID, descricao: c.descricao })),
    };
  }

  irParaGerenciarPacientes() {
    this.dialogSucessoAberto.set(false);
    this.router.navigate(['/administrador/pacientes/gerenciar']);
  }

  irParaDetalhes() {
    this.dialogSucessoAberto.set(false);
    this.router.navigate(['/administrador/pacientes', this.id()]);
  }

  cancelar() {
    this.confirmarCancelamentoAberto = true;
  }

  confirmarCancelamento() {
    this.confirmarCancelamentoAberto = false;
    this.location.back();
  }

  fecharConfirmacao() {
    this.confirmarCancelamentoAberto = false;
  }
}
