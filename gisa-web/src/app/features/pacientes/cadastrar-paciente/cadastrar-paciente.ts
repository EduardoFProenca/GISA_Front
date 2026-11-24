import { Component, ViewChild, inject, ChangeDetectorRef, signal } from '@angular/core';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { lerContextoPacientes } from '../contexto-pacientes';
import { lerErroApi } from '../../../core/http/erro-api';
import {
  DialogoResidenciaOutrosPacientes,
  ResidenciaOutrosPacientesItem,
} from '../../../shared/components/dialogo-residencia-outros-pacientes/dialogo-residencia-outros-pacientes';
import { firstValueFrom } from 'rxjs';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { ListaEnderecos } from '../../../shared/components/lista-enderecos/lista-enderecos';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';

import { InfoPaciente } from './formularios/info-paciente/info-paciente';
import { InfoEscola } from './formularios/info-escola/info-escola';
import { InfoResponsavel } from './formularios/info-responsavel/info-responsavel';
import { InfoProntuario } from './formularios/info-prontuario/info-prontuario';
import { InfoCid } from './formularios/info-cid/info-cid';
import { QuemMoraAqui } from './formularios/quem-mora-aqui/quem-mora-aqui';

import { PacienteService } from '../../../core/services/paciente';
import { EscolaService } from '../../../core/services/escola';
import { ResponsavelService } from '../../../core/services/responsavel';
import { TipoEscola } from '../../../core/models/escola.model';
import { CadastroPacienteResponse } from '../../../core/models/paciente.model';
import { soDigitos, vazio } from '../../../shared/utils/texto.util';
import { FormulariosPaciente, ResponsavelItem } from './models/formularios-paciente';
import { ajustarResidencia } from '../paciente-form.util';
import { PacienteValidadorService } from './services/paciente-validador';
import { PacienteCadastroPayloadService } from './services/paciente-payload';
import { PacienteErrosApiService } from './services/paciente-erros-api';

@Component({
  selector: 'app-cadastrar-paciente',
  imports: [DadosPessoais, ListaEnderecos, CabecalhoPagina, InfoPaciente, InfoEscola, InfoResponsavel, InfoProntuario, InfoCid, QuemMoraAqui, DialogoResidenciaOutrosPacientes],
  styleUrl: './cadastrar-paciente.scss',
  templateUrl: './cadastrar-paciente.html',
})
export class CadastrarPaciente {
  private avisoSucesso = inject(AvisoSucessoService);
  @ViewChild(DadosPessoais) dadosPessoais!: DadosPessoais;
  @ViewChild(ListaEnderecos) enderecos!: ListaEnderecos; // endereços do paciente (o do responsável fica dentro de InfoResponsavel)
  @ViewChild(InfoPaciente) infoPaciente!: InfoPaciente;
  @ViewChild(InfoResponsavel) infoResponsavel!: InfoResponsavel;
  @ViewChild(InfoEscola) infoEscola!: InfoEscola;
  @ViewChild(InfoProntuario) infoProntuario!: InfoProntuario;
  @ViewChild(InfoCid) infoCid!: InfoCid;

  private pacienteService = inject(PacienteService);
  private escolaService = inject(EscolaService);
  private responsavelService = inject(ResponsavelService);
  private router = inject(Router);
  private rotaBase = lerContextoPacientes(inject(ActivatedRoute)).rotaBase;
  private cdr = inject(ChangeDetectorRef);

  private validador = inject(PacienteValidadorService);
  private payload = inject(PacienteCadastroPayloadService);
  private errosApi = inject(PacienteErrosApiService);

  salvando = false;
  erro = '';
  nomeCadastrado = '';
  idCadastrado: number | null = null;
  // Muda a cada "Cadastrar outro"; o template recria os formulários quando ela muda.
  geracaoFormulario = signal(0);
  // 409: responsável que passa a residir e ainda mora com outros pacientes (o diálogo pergunta um a um).
  residenciasOutros: ResidenciaOutrosPacientesItem[] = [];

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

  private get formularios(): FormulariosPaciente {
    return {
      dadosPessoais: this.dadosPessoais,
      enderecos: this.enderecos,
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
    let res: CadastroPacienteResponse;
    try {
      res = await firstValueFrom(this.pacienteService.cadastrar(dados));
    } catch (e) {
      const residencias = lerErroApi(e)?.residenciasEmOutrosPacientes;
      if (residencias?.length) {
        this.residenciasOutros = residencias.map((r) => ({
          ...r,
          nome: f.infoResponsavel.listaResponsaveis.find((i) => i.idResponsavel === r.idResponsavel)?.nome.trim()
            ?? `Responsável ${r.idResponsavel}`,
        }));
        this.salvando = false;
        this.cdr.markForCheck();
        return; // abre o diálogo
      }
      const resultado = this.errosApi.tratar(e as HttpErrorResponse, this.formularios);
      this.finalizarComErro(resultado.mensagemGeral);
      return;
    }

    // O paciente já foi salvo: falha aqui só vira aviso.
    const aviso = await this.atualizarReaproveitados(f);
    this.salvando = false;
    this.nomeCadastrado = res?.nome || this.dadosPessoais.nome;
    this.idCadastrado = res?.idCadastro ?? null;
    this.erro = aviso;
    this.mostrarSucesso();
    this.cdr.markForCheck();
  }

  // Respostas do diálogo ficam nos itens; salvar de novo refaz o fluxo (nada foi gravado no 409).
  async confirmarResidenciasOutros(decisoes: Map<number, boolean>) {
    this.residenciasOutros = [];
    for (const item of this.infoResponsavel.listaResponsaveis) {
      if (item.idResponsavel != null && decisoes.has(item.idResponsavel)) {
        item.continuaComOutrosPacientes = decisoes.get(item.idResponsavel);
      }
    }
    await this.salvarCadastro();
  }

  cancelarResidenciasOutros() {
    this.residenciasOutros = [];
    this.cdr.markForCheck();
  }

  // Responsáveis já cadastrados: reativa os inativos e grava o endereço informado para quem não reside
  // com o paciente e não tinha. Devolve '' ou o aviso do que falhou.
  private async atualizarReaproveitados(f: FormulariosPaciente): Promise<string> {
    const falharam: string[] = [];
    for (const item of f.infoResponsavel.listaResponsaveis) {
      const dados = this.payload.atualizacaoPosVinculo(item);
      if (!dados || !item.idResponsavel) continue;
      try {
        await firstValueFrom(this.responsavelService.atualizar(item.idResponsavel, dados));
      } catch {
        falharam.push(item.nome.trim());
      }
    }
    return falharam.length
      ? `Paciente salvo, mas não foi possível atualizar o cadastro de ${falharam.join(', ')} (reativação ou endereço).`
      : '';
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

  private finalizarComErro(mensagem: string) {
    this.salvando = false;
    this.erro = mensagem;
    this.cdr.markForCheck();
    setTimeout(() => {
      document.querySelector('.input-erro, .erro-msg')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      this.router.navigateByUrl(`${this.rotaBase}/${this.idCadastrado}`);
    }
  }

  // Aviso de sucesso com os próximos passos (fim de fluxo).
  private mostrarSucesso() {
    this.avisoSucesso.mostrar({
      titulo: 'Paciente cadastrado',
      detalhe: this.nomeCadastrado,
      acoes: [
        { texto: 'Cadastrar outro', acao: () => this.aoContinuarCadastrando() },
        { texto: 'Ver paciente', primaria: true, acao: () => this.aoVerDetalhesCadastrado() },
      ],
    });
  }
}
