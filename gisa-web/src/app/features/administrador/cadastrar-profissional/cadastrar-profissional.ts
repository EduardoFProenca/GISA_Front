import { Component, ViewChild, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoEspecialista } from './formularios/info-especialista/info-especialista';
import { InfoUsuario } from './formularios/info-usuario/info-usuario';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { InfoProfissional } from './formularios/info-profissional/info-profissional';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { ProfissionalService } from '../../../services/profissional';
import { EspecialidadeService } from '../../../services/especialidade';
import { CargoService } from '../../../services/cargo';
import { PerfilService } from '../../../services/perfil';
import { Cargo } from '../../../core/models/cargo.model';
import { Perfil } from '../../../core/models/perfil.model';
import { CadastroResponse } from '../../../core/models/profissional.model';
import { Especialidade } from '../../../core/models/especialidade.model';
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
  private especialidadeService = inject(EspecialidadeService);
  private cargoService = inject(CargoService);
  private perfilService = inject(PerfilService);
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

  private cargos: Cargo[] = [];
  private perfis: Perfil[] = [];

  ngOnInit() {
    this.cargoService.listar().subscribe({ next: (c) => (this.cargos = c) });
    this.perfilService.listar().subscribe({ next: (p) => (this.perfis = p) });
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

  async salvarCadastro() {
    if (this.salvando) return;

    this.erro = '';
    const f = this.formularios;

    if (!this.validador.validar(f).valido) {
      this.finalizarComErro('Preencha os campos obrigatórios destacados em vermelho.');
      return;
    }

    this.salvando = true;

    try {
      const dadosBase = this.payload.montarDadosBase(f, this.cargos);
      const usuario = this.payload.montarUsuario(f, this.perfis);

      if (!f.infoEspecialista.ehEspecialista) {
        if (usuario) {
          this.profissionalService
            .cadastrarProfissionalComUsuario({ profissional: dadosBase, usuario })
            .subscribe(this.handlersPadrao());
        } else {
          this.profissionalService.cadastrarProfissional(dadosBase).subscribe(this.handlersPadrao());
        }
        return;
      }

      const selecionadas = f.infoEspecialista.especialidades.filter((e) => !!e);
      const todasEspecialidades = await new Promise<Especialidade[]>((resolve, reject) => {
        this.especialidadeService.listar().subscribe({ next: resolve, error: reject });
      });
      const especialidadesIds = this.payload.mapearEspecialidadesIds(f, todasEspecialidades);

      if (especialidadesIds.length !== selecionadas.length) {
        f.infoEspecialista.erros['especialidades'] = 'Especialidade não encontrada no sistema. Escolha outra.';
        this.finalizarComErro('Corrija os campos destacados em vermelho.');
        return;
      }

      const dadosEspecialista = this.payload.montarDadosEspecialista(f, dadosBase, especialidadesIds);

      if (f.infoEspecialista.atuaComoPJ) {
        const dadosPJ = this.payload.montarDadosEspecialistaPJ(f, dadosEspecialista);

        if (usuario) {
          this.profissionalService
            .cadastrarEspecialistaPJComUsuario({ especialistaPJ: dadosPJ, usuario })
            .subscribe(this.handlersPadrao());
        } else {
          this.profissionalService.cadastrarEspecialistaPJ(dadosPJ).subscribe(this.handlersPadrao());
        }
        return;
      }

      if (usuario) {
        this.profissionalService
          .cadastrarEspecialistaComUsuario({ especialista: dadosEspecialista, usuario })
          .subscribe(this.handlersPadrao());
      } else {
        this.profissionalService.cadastrarEspecialista(dadosEspecialista).subscribe(this.handlersPadrao());
      }
    } catch (e) {
      this.finalizarComErro('Não foi possível carregar as especialidades.');
    }
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
    this.infoProfissional.codigoCBO = '';
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