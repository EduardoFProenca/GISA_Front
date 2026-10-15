import { Component, ViewChild, inject, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoEspecialista } from './formularios/info-especialista/info-especialista';
import { InfoUsuario } from './formularios/info-usuario/info-usuario';
import { InfoAssistenteSocial } from './formularios/info-assistente-social/info-assistente-social';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { InfoProfissional } from './formularios/info-profissional/info-profissional';
import { ProfissionalService } from '../../../core/services/profissional';
import { CadastroResponse } from '../../../core/models/profissional.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { OpcoesProfissional, OpcoesProfissionalService } from './services/opcoes-profissional';
import { FormulariosCadastro } from './models/formularios-cadastro';
import { CadastroValidadorService } from './services/cadastro-validador';
import { CadastroPayloadService } from './services/cadastro-payload';
import { CadastroErrosApiService } from './services/cadastro-erros-api';

@Component({
  selector: 'app-cadastrar-profissional',
  imports: [DadosPessoais, Contato, InfoEspecialista, InfoAssistenteSocial, InfoUsuario, CabecalhoPagina, InfoProfissional],
  templateUrl: './cadastrar-profissional.html',
  styleUrl: './cadastrar-profissional.scss',
})
export class CadastroProfissional implements OnInit {
  private avisoSucesso = inject(AvisoSucessoService);
  @ViewChild(DadosPessoais) dadosPessoais!: DadosPessoais;
  @ViewChild(Contato) contato!: Contato;
  @ViewChild(InfoProfissional) infoProfissional!: InfoProfissional;
  @ViewChild(InfoUsuario) infoUsuario!: InfoUsuario;
  @ViewChild(InfoEspecialista) infoEspecialista!: InfoEspecialista;
  @ViewChild(InfoAssistenteSocial) infoAssistenteSocial!: InfoAssistenteSocial;

  private profissionalService = inject(ProfissionalService);
  private opcoesService = inject(OpcoesProfissionalService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private validador = inject(CadastroValidadorService);
  private payload = inject(CadastroPayloadService);
  private errosApi = inject(CadastroErrosApiService);

  salvando = false;
  erro = '';
  nomeCadastrado = '';
  idCadastrado: number | null = null;
  // Muda a cada "Cadastrar outro"; o template recria os formulários quando ela muda.
  geracaoFormulario = signal(0);

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
      infoAssistenteSocial: this.infoAssistenteSocial,
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

    if (f.infoAssistenteSocial.ehAssistenteSocial) {
      const assistenteSocial = this.payload.montarDadosAssistenteSocial(f, dadosBase);
      const req = usuario
        ? this.profissionalService.cadastrarAssistenteSocialComUsuario({ assistenteSocial, usuario })
        : this.profissionalService.cadastrarAssistenteSocial(assistenteSocial);
      req.subscribe(this.handlersPadrao());
      return;
    }

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
        this.mostrarSucesso(res?.emailEnviado === false);
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

  // Recria os formulários do zero (o botão vem do aviso, fora desta tela: zerar os campos dos filhos
  // não redesenharia a tela deles).
  aoContinuarCadastrando() {
    this.erro = '';
    this.idCadastrado = null;
    this.geracaoFormulario.update((n) => n + 1);
    window.scrollTo({ top: 0 });
  }

  aoVerDetalhesCadastrado() {
    if (this.idCadastrado != null) {
      this.router.navigate(['/administrador/profissionais', this.idCadastrado]);
    }
  }

  // Aviso de sucesso com os próximos passos (fim de fluxo). emailNaoEnviado: o acesso foi criado, mas a
  // senha temporária não chegou ao e-mail; o reenvio fica no detalhe do profissional.
  private mostrarSucesso(emailNaoEnviado = false) {
    this.avisoSucesso.mostrar({
      titulo: 'Profissional cadastrado',
      detalhe: emailNaoEnviado
        ? `${this.nomeCadastrado}. Atenção: o e-mail com a senha temporária não foi enviado. Reenvie pelo detalhe do profissional ("Enviar nova senha temporária").`
        : this.nomeCadastrado,
      acoes: [
        { texto: 'Cadastrar outro', acao: () => this.aoContinuarCadastrando() },
        { texto: 'Ver profissional', primaria: true, acao: () => this.aoVerDetalhesCadastrado() },
      ],
    });
  }
}
