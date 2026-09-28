import { Component, ViewChild, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { ComErros } from '../../../shared/components/com-erros';
import { InfoEspecialista } from './formularios/info-especialista/info-especialista';
import { InfoUsuario } from './formularios/info-usuario/info-usuario';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { InfoProfissional } from './formularios/info-profissional/info-profissional';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';
import { ProfissionalService } from '../../../services/profissional';
import { EspecialidadeService } from '../../../services/especialidade';
import { CargoService } from '../../../services/cargo';
import { PerfilService } from '../../../services/perfil';
import { Especialidade } from '../../../core/models/especialidade.model';
import { Cargo, Perfil } from '../../../core/models/cargo.model';
import {
  Endereco,
  DadosBaseProfissional,
  DadosEspecialista,
  DadosEspecialistaPJ,
  Jornada,
  CadastroResponse
} from '../../../core/models/profissional.model';

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

  // ---------- utilitários ----------

  private soDigitos(valor: string | null | undefined): string {
    return (valor ?? '').replace(/\D/g, '');
  }

  private vazio(valor: unknown): boolean {
    return valor == null || String(valor).trim() === '';
  }

  private get formularios(): ComErros[] {
    return [this.dadosPessoais, this.contato, this.infoProfissional, this.infoUsuario, this.infoEspecialista];
  }

  private idCargoPorNome(nomeCargo: string): number {
    const alvo = nomeCargo.replace(/_/g, ' ').toLowerCase();
    const encontrado = this.cargos.find((c) => c.nome.toLowerCase() === alvo);
    return encontrado?.idCargo ?? this.cargos[0]?.idCargo ?? 0;
  }

  private idPerfilPorNome(nomePerfil: string): number {
    const alvo = nomePerfil.replace(/_/g, ' ').toLowerCase();
    const encontrado = this.perfis.find((p) => p.nome.toLowerCase() === alvo);
    return encontrado?.idPerfil ?? this.perfis[0]?.idPerfil ?? 0;
  }

  // ---------- validação (obrigatórios) ----------

  private validar(): boolean {
    const OBRIGATORIO = 'Campo obrigatório.';
    let valido = true;
    const marcar = (alvo: ComErros, campo: string, mensagem: string = OBRIGATORIO) => {
      alvo.erros[campo] = mensagem;
      valido = false;
    };

    this.formularios.forEach((f) => (f.erros = {}));

    const dp = this.dadosPessoais;
    if (this.vazio(dp.nome)) marcar(dp, 'nome');

    const cpf = this.soDigitos(dp.cpf);
    if (!cpf) marcar(dp, 'cpf');
    else if (cpf.length !== 11) marcar(dp, 'cpf', 'O CPF deve ter 11 dígitos.');

    if (this.vazio(dp.dataNascimento)) marcar(dp, 'dataNascimento');
    if (this.vazio(dp.sexo)) marcar(dp, 'sexo');
    if (this.vazio(dp.estadoCivil)) marcar(dp, 'estadoCivil');

    const celular = this.soDigitos(dp.celular);
    if (!celular) marcar(dp, 'celular');
    else if (celular.length < 10 || celular.length > 11) marcar(dp, 'celular', 'Celular inválido. Use DDD + número.');

    if (this.vazio(dp.email)) marcar(dp, 'email');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dp.email.trim())) marcar(dp, 'email', 'E-mail inválido.');

    const c = this.contato;
    const cep = this.soDigitos(c.cep);
    if (!cep) marcar(c, 'cep');
    else if (cep.length !== 8) marcar(c, 'cep', 'O CEP deve ter 8 dígitos.');
    if (this.vazio(c.endereco)) marcar(c, 'endereco');
    if (this.vazio(c.numero)) marcar(c, 'numero');
    if (this.vazio(c.bairro)) marcar(c, 'bairro');
    if (this.vazio(c.cidade)) marcar(c, 'cidade');
    if (this.vazio(c.uf)) marcar(c, 'uf');

    if (this.vazio(this.infoProfissional.cargo)) marcar(this.infoProfissional, 'cargo');

    const iu = this.infoUsuario;
    if (iu.temAcessoSistema) {
      if (this.vazio(iu.senha)) marcar(iu, 'senha');
      else if (iu.senha.length < 8 || iu.senha.length > 30) {
        marcar(iu, 'senha', 'A senha deve ter entre 8 e 30 caracteres.');
      }
      if (this.vazio(iu.perfil)) marcar(iu, 'perfil');
    }

    const ie = this.infoEspecialista;
    if (ie.ehEspecialista) {
      if (this.vazio(ie.registroProfissional)) marcar(ie, 'registroProfissional');

      if (!ie.especialidades.some((e) => !this.vazio(e))) {
        marcar(ie, 'especialidades', 'Selecione ao menos uma especialidade.');
      }

      if (this.mapearJornadas().length === 0) {
        marcar(ie, 'jornadas', 'Informe ao menos um horário completo (dia, início e término).');
      }

      if (ie.atuaComoPJ) {
        const cnpj = this.soDigitos(ie.cnpj);
        if (!cnpj) marcar(ie, 'cnpj');
        else if (cnpj.length !== 14) marcar(ie, 'cnpj', 'O CNPJ deve ter 14 dígitos.');
        if (this.vazio(ie.razaoSocial)) marcar(ie, 'razaoSocial');
      }
    }

    return valido;
  }

  // ---------- montagem do payload ----------

  private montarEndereco(): Endereco {
    const c = this.contato;
    return {
      cep: this.soDigitos(c.cep),
      rua: c.endereco.trim(),
      numero: c.numero.trim(),
      complemento: c.complemento?.trim() || undefined,
      bairro: c.bairro.trim(),
      cidade: c.cidade.trim(),
      estado: c.uf,
    };
  }

  private montarDadosBase(): DadosBaseProfissional {
    const dp = this.dadosPessoais;
    return {
      nome: dp.nome.trim(),
      cpf: this.soDigitos(dp.cpf),
      dataNascimento: dp.dataNascimento,
      sexo: dp.sexo,
      celular: this.soDigitos(dp.celular),
      numCNS: this.soDigitos(dp.numCNS) || undefined,
      estadoCivil: dp.estadoCivil,
      enderecos: [this.montarEndereco()],
      email: dp.email.trim(),
      idCargo: this.idCargoPorNome(this.infoProfissional.cargo),
    };
  }

  private mapearJornadas(): Jornada[] {
    return this.infoEspecialista.jornadas
      .filter((j) => j.diaSemana && j.horaInicio && j.horaTermino)
      .map((j) => ({
        diaSemana: Number(j.diaSemana),
        horaInicio: j.horaInicio,
        horaTermino: j.horaTermino,
      }));
  }

  private async mapearEspecialidadesIds(): Promise<number[]> {
    const selecionadas = this.infoEspecialista.especialidades.filter((e) => !!e);
    if (!selecionadas.length) return [];

    const todas: Especialidade[] = await new Promise((resolve, reject) => {
      this.especialidadeService.listar().subscribe({ next: resolve, error: reject });
    });

    const ids: number[] = [];
    for (const valor of selecionadas) {
      const opcao = this.infoEspecialista.opcoesEspecialidade.find((o) => o.valor === valor);
      const nomeLabel = opcao?.label ?? valor;
      const encontrada = todas.find((e) => e.nome.toLowerCase() === nomeLabel.toLowerCase());
      if (encontrada) ids.push(encontrada.idEspecialidade);
    }
    return ids;
  }

  // ---------- salvar ----------

  async salvarCadastro() {
    if (this.salvando) return;

    this.erro = '';
    if (!this.validar()) {
      this.finalizarComErro('Preencha os campos obrigatórios destacados em vermelho.');
      return;
    }

    this.salvando = true;

    try {
      const dadosBase = this.montarDadosBase();
      const usuario = this.infoUsuario.temAcessoSistema
        ? { senha: this.infoUsuario.senha, idPerfil: this.idPerfilPorNome(this.infoUsuario.perfil) }
        : null;

      if (!this.infoEspecialista.ehEspecialista) {
        if (usuario) {
          this.profissionalService
            .cadastrarProfissionalComUsuario({ profissional: dadosBase, usuario })
            .subscribe(this.handlersPadrao());
        } else {
          this.profissionalService.cadastrarProfissional(dadosBase).subscribe(this.handlersPadrao());
        }
        return;
      }

      const selecionadas = this.infoEspecialista.especialidades.filter((e) => !!e);
      const especialidadesIds = await this.mapearEspecialidadesIds();
      if (especialidadesIds.length !== selecionadas.length) {
        this.infoEspecialista.erros['especialidades'] = 'Especialidade não encontrada no sistema. Escolha outra.';
        this.finalizarComErro('Corrija os campos destacados em vermelho.');
        return;
      }

      const dadosEspecialista: DadosEspecialista = {
        ...dadosBase,
        registroConselho: this.infoEspecialista.registroProfissional.trim(),
        especialidadesIds,
        novasEspecialidades: [],
        jornadas: this.mapearJornadas(),
      };

      if (this.infoEspecialista.atuaComoPJ) {
        const dadosPJ: DadosEspecialistaPJ = {
          ...dadosEspecialista,
          cnpj: this.soDigitos(this.infoEspecialista.cnpj),
          razaoSocial: this.infoEspecialista.razaoSocial.trim(),
          nomeFantasia: this.infoEspecialista.nomeFantasia.trim(),
          inscricaoEstadual: this.infoEspecialista.inscricaoEstadual.trim(),
        };

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

  // ---------- retorno da API ----------

  private handlersPadrao() {
    return {
      next: (res: CadastroResponse) => {
        this.salvando = false;
        this.nomeCadastrado = res?.nome || this.dadosPessoais.nome;
        this.idCadastrado = res?.idCadastro ?? null;
        this.dialogSucessoAberto = true;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => this.tratarErroApi(err),
    };
  }

  private tratarErroApi(err: HttpErrorResponse) {
    if (err.status === 0) {
      this.finalizarComErro('Não foi possível conectar ao servidor. Tente novamente.');
      return;
    }

    const campos: Record<string, string> = err.error?.fields ?? {};
    const semDestino: string[] = [];
    let mapeados = 0;

    for (const [chave, mensagem] of Object.entries(campos)) {
      const destino = this.destinoCampo(chave);
      if (destino) {
        destino[0].erros[destino[1]] = mensagem;
        mapeados++;
      } else {
        semDestino.push(mensagem);
      }
    }

    let mensagemGeral = err.error?.message || 'Erro ao salvar cadastro.';
    if (mapeados > 0) {
      mensagemGeral =
        err.status === 409
          ? 'Alguns dados já existem no sistema. Corrija os campos destacados em vermelho.'
          : 'Corrija os campos destacados em vermelho.';
    }
    if (semDestino.length) mensagemGeral += ' ' + semDestino.join(' ');

    this.finalizarComErro(mensagemGeral);
  }

  // Converte a chave do erro da API (ex.: "enderecos[0].cep", "usuario.senha") para [componente, campo]
  private destinoCampo(chave: string): [ComErros, string] | null {
    const k = chave.split('.').pop()!.replace(/\[\d+\]/g, '');
    const dp = this.dadosPessoais;
    const c = this.contato;
    const ie = this.infoEspecialista;

    const mapa: Record<string, [ComErros, string]> = {
      nome: [dp, 'nome'],
      cpf: [dp, 'cpf'],
      email: [dp, 'email'],
      dataNascimento: [dp, 'dataNascimento'],
      sexo: [dp, 'sexo'],
      celular: [dp, 'celular'],
      estadoCivil: [dp, 'estadoCivil'],
      numCNS: [dp, 'numCNS'],
      cep: [c, 'cep'],
      rua: [c, 'endereco'],
      numero: [c, 'numero'],
      bairro: [c, 'bairro'],
      cidade: [c, 'cidade'],
      estado: [c, 'uf'],
      idCargo: [this.infoProfissional, 'cargo'],
      senha: [this.infoUsuario, 'senha'],
      idPerfil: [this.infoUsuario, 'perfil'],
      registroConselho: [ie, 'registroProfissional'],
      especialidadesIds: [ie, 'especialidades'],
      novasEspecialidades: [ie, 'especialidades'],
      jornadas: [ie, 'jornadas'],
      diaSemana: [ie, 'jornadas'],
      horaInicio: [ie, 'jornadas'],
      horaTermino: [ie, 'jornadas'],
      cnpj: [ie, 'cnpj'],
      razaoSocial: [ie, 'razaoSocial'],
    };

    return mapa[k] ?? null;
  }

  private finalizarComErro(mensagem: string) {
    this.salvando = false;
    this.erro = mensagem;
    this.cdr.markForCheck();
    setTimeout(() => {
      document.querySelector('.input-erro')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  // ---------- diálogo de sucesso ----------

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
    this.formularios.forEach((f) => (f.erros = {}));
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