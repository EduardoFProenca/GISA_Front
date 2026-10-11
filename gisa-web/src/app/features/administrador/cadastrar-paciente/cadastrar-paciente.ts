import { Component, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { SucessoDialog } from '../../../shared/components/sucesso-dialog/sucesso-dialog';

import { InfoPaciente } from './formularios/info-paciente/info-paciente';
import { InfoEscola } from './formularios/info-escola/info-escola';
import { InfoResponsavel } from './formularios/info-responsavel/info-responsavel';
import { InfoProntuario } from './formularios/info-prontuario/info-prontuario';
import { InfoCid } from './formularios/info-cid/info-cid';

import { PacienteService } from '../../../services/paciente';
import { EscolaService } from '../../../services/escola';
import { TipoEscola } from '../../../core/models/paciente.model';
import { CadastroPacienteResponse } from '../../../core/models/paciente-cadastro.model';
import { soDigitos, vazio } from '../../../shared/utils/texto.util';
import { FormulariosPaciente, listaErros } from './models/formularios-paciente';
import { PacienteValidadorService } from './services/paciente-validador';
import { PacienteCadastroPayloadService } from './services/paciente-payload';
import { PacienteErrosApiService } from './services/paciente-erros-api';

@Component({
  selector: 'app-cadastrar-paciente',
  imports: [DadosPessoais, Contato, CabecalhoPagina, InfoPaciente, InfoEscola, InfoResponsavel, InfoProntuario, InfoCid, SucessoDialog],
  styleUrl: './cadastrar-paciente.scss',
  templateUrl: './cadastrar-paciente.html',
})
export class CadastrarPaciente {
  @ViewChild(DadosPessoais) dadosPessoais!: DadosPessoais;
  @ViewChild(Contato) contato!: Contato; // endereço do paciente (o do responsável fica dentro de InfoResponsavel)
  @ViewChild(InfoPaciente) infoPaciente!: InfoPaciente;
  @ViewChild(InfoResponsavel) infoResponsavel!: InfoResponsavel;
  @ViewChild(InfoEscola) infoEscola!: InfoEscola;
  @ViewChild(InfoProntuario) infoProntuario!: InfoProntuario;
  @ViewChild(InfoCid) infoCid!: InfoCid;

  private pacienteService = inject(PacienteService);
  private escolaService = inject(EscolaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private validador = inject(PacienteValidadorService);
  private payload = inject(PacienteCadastroPayloadService);
  private errosApi = inject(PacienteErrosApiService);

  salvando = false;
  erro = '';

  dialogSucessoAberto = false;
  nomeCadastrado = '';
  idCadastrado: number | null = null;

  private get formularios(): FormulariosPaciente {
    return {
      dadosPessoais: this.dadosPessoais,
      contato: this.contato,
      infoPaciente: this.infoPaciente,
      infoResponsavel: this.infoResponsavel,
      infoEscola: this.infoEscola,
      infoProntuario: this.infoProntuario,
      infoCid: this.infoCid,
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

    let idEscola: number | undefined;
    try {
      idEscola = await this.resolverEscola();
    } catch (e) {
      const mensagem = e instanceof HttpErrorResponse
        ? this.errosApi.tratarEscola(e, this.infoEscola)
        : 'Não foi possível cadastrar a escola.';
      this.finalizarComErro(mensagem);
      return;
    }

    const dados = this.payload.montar(f, idEscola);
    this.pacienteService.cadastrar(dados).subscribe(this.handlersPadrao());
  }

  // Escola escolhida na lista -> usa o id. Escola nova (digitada) -> cadastra antes do paciente.
  private async resolverEscola(): Promise<number | undefined> {
    const ie = this.infoEscola;
    if (ie.escolaSelecionada) return ie.escolaSelecionada.idEscola;
    if (vazio(ie.nome)) return undefined;

    const criada = await firstValueFrom(
      this.escolaService.cadastrar({
        nome: ie.nome.trim(),
        tipoEscola: ie.tipoEscola as TipoEscola,
        telefone: soDigitos(ie.telefone) || undefined,
      })
    );
    // Se o cadastro do paciente falhar, uma nova tentativa reaproveita esta escola (sem duplicar).
    ie.escolaSelecionada = criada;
    return criada.idEscola;
  }

  private handlersPadrao() {
    return {
      next: (res: CadastroPacienteResponse) => {
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
      document.querySelector('.input-erro, .erro-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  private limparFormulario() {
    Object.assign(this.dadosPessoais, {
      nome: '', cpf: '', email: '', dataNascimento: '', sexo: '', celular: '', estadoCivil: '', numCNS: ''
    });
    Object.assign(this.contato, {
      cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
    });
    this.infoPaciente.limpar();
    this.infoResponsavel.limpar();
    this.infoEscola.limpar();
    this.infoProntuario.limpar();
    this.infoCid.limpar();
    listaErros(this.formularios).forEach((b) => (b.erros = {}));
    this.erro = '';
  }

  aoContinuarCadastrando() {
    this.dialogSucessoAberto = false;
    this.limparFormulario();
  }

  aoVerDetalhesCadastrado() {
    this.dialogSucessoAberto = false;
    if (this.idCadastrado != null) {
      this.router.navigate(['/administrador/pacientes', this.idCadastrado]);
    }
  }
}
