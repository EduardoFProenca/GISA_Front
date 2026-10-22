import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoProfissional } from '../cadastrar-profissional/formularios/info-profissional/info-profissional';
import { InfoUsuario } from '../cadastrar-profissional/formularios/info-usuario/info-usuario';
import { InfoEspecialista } from '../cadastrar-profissional/formularios/info-especialista/info-especialista';
import { InfoAssistenteSocial } from '../cadastrar-profissional/formularios/info-assistente-social/info-assistente-social';
import { FormulariosCadastro, InfoAssistenteSocialForm, InfoEspecialistaForm } from '../cadastrar-profissional/models/formularios-cadastro';
import { CadastroValidadorService } from '../cadastrar-profissional/services/cadastro-validador';
import { CadastroPayloadService } from '../cadastrar-profissional/services/cadastro-payload';
import { CadastroErrosApiService } from '../cadastrar-profissional/services/cadastro-erros-api';
import { OpcoesProfissional, OpcoesProfissionalService } from '../cadastrar-profissional/services/opcoes-profissional';
import { ProfissionalService, tipoDoDetalhe } from '../../../core/services/profissional';
import { ProfissionalDetalhe } from '../../../core/models/profissional.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { FormulariosDetalhe, paraFormularios } from '../detalhe-profissional/profissional-detalhe.util';

// Formulário vazio para quem não é assistente social (o validador e o payload ignoram o bloco).
function semAssistenteSocial(): InfoAssistenteSocialForm {
  return { ehAssistenteSocial: false, registroConselho: '', idsPacientes: [], erros: {}, limparErro() {} };
}

// Formulário vazio para quem não é especialista (o PATCH de profissional e de assistente social não leva esses campos).
function semEspecialista(): InfoEspecialistaForm {
  return {
    ehEspecialista: false,
    registroProfissional: '',
    especialidades: [],
    opcoesEspecialidade: [],
    jornadas: [],
    atuaComoPJ: false,
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoEstadual: '',
    erros: {},
    limparErro() {},
  };
}

@Component({
  selector: 'app-editar-profissional',
  imports: [
    CabecalhoPagina,
    ConfirmDialog,
    DadosPessoais,
    Contato,
    InfoProfissional,
    InfoUsuario,
    InfoEspecialista,
    InfoAssistenteSocial,
  ],
  templateUrl: './editar-profissional.html',
  styleUrl: './editar-profissional.scss',
})
export class EditarProfissional implements OnInit {
  private avisoSucesso = inject(AvisoSucessoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private profissionalService = inject(ProfissionalService);
  private opcoesService = inject(OpcoesProfissionalService);
  private validador = inject(CadastroValidadorService);
  private payload = inject(CadastroPayloadService);
  private errosApi = inject(CadastroErrosApiService);

  @ViewChild(DadosPessoais) dadosPessoaisForm?: DadosPessoais;
  @ViewChild(Contato) contatoForm?: Contato;
  @ViewChild(InfoProfissional) infoProfissionalForm?: InfoProfissional;
  @ViewChild(InfoUsuario) infoUsuarioForm?: InfoUsuario;
  // Só existe na tela quando o cadastro é de especialista ou PJ.
  @ViewChild(InfoEspecialista) infoEspecialistaForm?: InfoEspecialista;
  // Só existe na tela quando o cadastro é de assistente social.
  @ViewChild(InfoAssistenteSocial) infoAssistenteSocialForm?: InfoAssistenteSocial;

  id = Number(this.route.snapshot.paramMap.get('id'));

  // Os formulários filhos só leem dadosIniciais no ngOnInit: renderizam depois de carregar.
  carregando = signal(true);
  erro = signal('');
  erroGeral = signal('');
  salvando = signal(false);
  confirmarCancelamentoAberto = signal(false);
  nomeSalvo = signal('');

  detalhe = signal<ProfissionalDetalhe | null>(null);
  formularios = signal<FormulariosDetalhe | null>(null);
  opcoes = signal<OpcoesProfissional>({ cargos: [], perfis: [], especialidades: [] });
  tipo = computed(() => {
    const d = this.detalhe();
    return d ? tipoDoDetalhe(d) : 'PROFISSIONAL';
  });
  ehEspecialista = computed(() => this.tipo() === 'ESPECIALISTA' || this.tipo() === 'ESPECIALISTA_PJ');

  ngOnInit() {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.erro.set('Profissional inválido.');
      this.carregando.set(false);
      return;
    }

    forkJoin({ detalhe: this.profissionalService.buscarDetalhe(this.id), opcoes: this.opcoesService.carregar() })
      .subscribe({
        next: ({ detalhe, opcoes }) => {
          this.opcoes.set(opcoes);
          this.detalhe.set(detalhe);
          this.formularios.set(paraFormularios(detalhe));
          this.carregando.set(false);
        },
        error: (err) => {
          this.erro.set(err?.status === 404 ? 'Profissional não encontrado.' : mensagemDeErro(err, 'Não foi possível carregar o profissional.'));
          this.carregando.set(false);
        },
      });
  }

  private get formulariosAtuais(): FormulariosCadastro | null {
    if (!this.dadosPessoaisForm || !this.contatoForm || !this.infoProfissionalForm || !this.infoUsuarioForm) {
      return null;
    }
    return {
      dadosPessoais: this.dadosPessoaisForm,
      contato: this.contatoForm,
      infoProfissional: this.infoProfissionalForm,
      infoUsuario: this.infoUsuarioForm,
      infoEspecialista: this.infoEspecialistaForm ?? semEspecialista(),
      infoAssistenteSocial: this.infoAssistenteSocialForm ?? semAssistenteSocial(),
    };
  }

  // PATCH na rota do tipo e, se marcado "Terá acesso", concede o acesso em seguida.
  async salvarEdicao() {
    const f = this.formulariosAtuais;
    if (!f || this.salvando()) return;

    this.erroGeral.set('');
    if (!this.validador.validar(f).valido) {
      this.erroGeral.set('Preencha os campos obrigatórios destacados em vermelho.');
      setTimeout(() => document.querySelector('.input-erro')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return;
    }

    this.salvando.set(true);
    try {
      await firstValueFrom(this.profissionalService.atualizar(this.id, this.tipo(), this.payload.montarAtualizacao(f)));
      const usuario = this.payload.montarUsuario(f);
      let emailNaoEnviado = false;
      if (usuario) {
        const acesso = await firstValueFrom(this.profissionalService.concederAcesso(this.id, this.tipo(), usuario));
        emailNaoEnviado = !acesso.emailEnviado;
        // Evita conceder de novo se o usuário salvar outra vez nesta tela.
        f.infoUsuario.possuiAcesso = true;
      }
      this.nomeSalvo.set(f.dadosPessoais.nome.trim());
      this.mostrarSucesso(emailNaoEnviado);
    } catch (err) {
      const resultado = this.errosApi.tratar(err, f);
      this.erroGeral.set(resultado.mensagemGeral);
      // Erro com campo (ex.: jornada recusada por terapias agendadas): leva a tela até ele.
      if (resultado.algumCampoMarcado) {
        setTimeout(() => document.querySelector('.erro-msg:not(.erro-geral)')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      }
    } finally {
      this.salvando.set(false);
    }
  }

  irParaGerenciarProfissionais() {
    this.router.navigate(['/profissionais/gerenciar']);
  }

  irParaDetalhes() {
    this.router.navigate(['/profissionais', this.id]);
  }

  confirmarCancelamento() {
    this.confirmarCancelamentoAberto.set(false);
    this.location.back();
  }

  // Aviso de sucesso com os próximos passos (fim de fluxo).
  private mostrarSucesso(emailNaoEnviado = false) {
    this.avisoSucesso.mostrar({
      titulo: 'Alterações salvas',
      detalhe: emailNaoEnviado
        ? `${this.nomeSalvo()}. Atenção: o acesso foi criado, mas o e-mail com a senha temporária não foi enviado. Reenvie pelo detalhe do profissional.`
        : this.nomeSalvo(),
      acoes: [
        { texto: 'Voltar à lista', acao: () => this.irParaGerenciarProfissionais() },
        { texto: 'Ver profissional', primaria: true, acao: () => this.irParaDetalhes() },
      ],
    });
  }
}
