import { Component, ViewChild, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoEspecialista } from './formularios/info-especialista/info-especialista';
import { InfoUsuario } from './formularios/info-usuario/info-usuario';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { InfoProfissional } from './formularios/info-profissional/info-profissional';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { ProfissionalService } from '../../../core/services/profissional';
import { CadastroResponse } from '../../../core/models/profissional.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { OpcoesProfissional, OpcoesProfissionalService } from './services/opcoes-profissional';
import { FormulariosCadastro, listaErros } from './models/formularios-cadastro';
import { CadastroValidadorService } from './services/cadastro-validador';
import { CadastroPayloadService } from './services/cadastro-payload';
import { CadastroErrosApiService } from './services/cadastro-erros-api';

@Component({
  selector: 'app-cadastrar-profissional',
  imports: [DadosPessoais, Contato, InfoEspecialista, InfoUsuario, CabecalhoPagina, InfoProfissional, SucessoDialog],
  templateUrl: './cadastrar-profissional.html',
  styleUrl: './cadastrar-profissional.scss',
})
export class CadastroProfissional implements OnInit {
  @ViewChild(DadosPessoais) dadosPessoais!: DadosPessoais;
  @ViewChild(Contato) contato!: Contato;
  @ViewChild(InfoProfissional) infoProfissional!: InfoProfissional;
  @ViewChild(InfoUsuario) infoUsuario!: InfoUsuario;
  @ViewChild(InfoEspecialista) infoEspecialista!: InfoEspecialista;

  private profissionalService = inject(ProfissionalService);
  private opcoesService = inject(OpcoesProfissionalService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private validador = inject(CadastroValidadorService);
  private payload = inject(CadastroPayloadService);
  private errosApi = inject(CadastroErrosApiService);

  salvando = false;
  erro = '';

  dialogSucessoAberto = false;
  nomeCadastrado = '';
  idCadastrado: number | null = null;

  // Cargos, perfis e especialidades da API (opções dos selects).
  opcoes = signal<OpcoesProfissional>({ cargos: [], perfis: [], especialidades: [] });

  ngOnInit() {
    this.opcoesService.carregar().subscribe({
      next: (o) => this.opcoes.set(o),
      error: (err) => this.finalizarComErro(mensagemDeErro(err, 'Não foi possível carregar cargos, perfis e especialidades.')),
    });
  }

  private get formularios(): FormulariosCadastro {
    return {
      dadosPessoais: this.dadosPessoais,
      contato: this.contato,
      infoProfissional: this.infoProfissional,
      infoUsuario: this.infoUsuario,
      infoEspecialista: this.infoEspecialista,
    };
  }

  salvarCadastro() {
    if (this.salvando) return;

    this.erro = '';
    const f = this.formularios;

    if (!this.validador.validar(f).valido) {
      this.finalizarComErro('Preencha os campos obrigatórios destacados em vermelho.');
      return;
    }

    this.salvando = true;

    const dadosBase = this.payload.montarDadosBase(f);
    const usuario = this.payload.montarUsuario(f);
    const ie = f.infoEspecialista;

    if (!ie.ehEspecialista) {
      const req = usuario
        ? this.profissionalService.cadastrarProfissionalComUsuario({ profissional: dadosBase, usuario })
        : this.profissionalService.cadastrarProfissional(dadosBase);
      req.subscribe(this.handlersPadrao());
      return;
    }

    const especialista = this.payload.montarDadosEspecialista(f, dadosBase);
    if (ie.atuaComoPJ) {
      const pj = this.payload.montarDadosEspecialistaPJ(f, especialista);
      const req = usuario
        ? this.profissionalService.cadastrarEspecialistaPJComUsuario({ especialistaPJ: pj, usuario })
        : this.profissionalService.cadastrarEspecialistaPJ(pj);
      req.subscribe(this.handlersPadrao());
      return;
    }

    const req = usuario
      ? this.profissionalService.cadastrarEspecialistaComUsuario({ especialista, usuario })
      : this.profissionalService.cadastrarEspecialista(especialista);
    req.subscribe(this.handlersPadrao());
  }

  private handlersPadrao() {
    return {
      next: (res: CadastroResponse) => {
        this.salvando = false;
        this.nomeCadastrado = res?.nome || this.dadosPessoais.nome;
        this.idCadastrado = res?.idCadastro ?? null;
        this.dialogSucessoAberto = true;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        const resultado = this.errosApi.tratar(err, this.formularios);
        this.finalizarComErro(resultado.mensagemGeral);
      },
    };
  }

  private finalizarComErro(mensagem: string) {
    this.salvando = false;
    this.erro = mensagem;
    this.cdr.markForCheck();
    setTimeout(() => {
      document.querySelector('.input-erro')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  private limparFormulario() {
    Object.assign(this.dadosPessoais, {
      nome: '', cpf: '', email: '', dataNascimento: '', sexo: '', celular: '', estadoCivil: '', numCNS: ''
    });
    Object.assign(this.contato, {
      cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
    });
    this.infoProfissional.cargo = '';
    this.infoUsuario.temAcessoSistema = false;
    this.infoUsuario.senha = '';
    this.infoUsuario.perfil = '';
    this.infoEspecialista.ehEspecialista = false;
    this.infoEspecialista.atuaComoPJ = false;
    this.infoEspecialista.registroProfissional = '';
    this.infoEspecialista.cnpj = '';
    this.infoEspecialista.razaoSocial = '';
    this.infoEspecialista.nomeFantasia = '';
    this.infoEspecialista.inscricaoEstadual = '';
    this.infoEspecialista.especialidades = [''];
    this.infoEspecialista.jornadas = [{ diaSemana: '', horaInicio: '', horaTermino: '' }];
    listaErros(this.formularios).forEach((f) => (f.erros = {}));
    this.erro = '';
  }

  aoContinuarCadastrando() {
    this.dialogSucessoAberto = false;
    this.limparFormulario();
  }

  aoVerDetalhesCadastrado() {
    this.dialogSucessoAberto = false;
    if (this.idCadastrado != null) {
      this.router.navigate(['/administrador/profissionais', this.idCadastrado]);
    }
  }
}