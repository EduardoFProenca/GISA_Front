import { CampoDetalhe } from '../../../shared/components/campo-detalhe/campo-detalhe';
import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { InativacaoPacienteResponse, Paciente } from '../../../core/models/paciente.model';
import { PacienteService } from '../../../core/services/paciente';
import { ProfissionalService } from '../../../core/services/profissional';
import { SelectBusca } from '../../../shared/components/select-busca/select-busca';
import { buscaAssistentesSociais } from '../../../shared/components/select-busca/buscas';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { lerContextoPacientes } from '../contexto-pacientes';
import { HistoricoPaciente } from './historico-paciente/historico-paciente';
import { TerapiasPaciente } from './terapias-paciente/terapias-paciente';
import { formatarCelular, formatarCep, formatarCns, formatarCpf } from '../../../shared/utils/formatacao.util';
import { dataCurta } from '../../../shared/utils/data.util';
import {
  ROTULO_ESTADO_CIVIL,
  ROTULO_PARENTESCO,
  ROTULO_SEXO,
  ROTULO_STATUS_CADASTRO,
  ROTULO_STATUS_PACIENTE,
  ROTULO_TIPO_ESCOLA,
  resumoInativacaoPaciente,
} from '../../../shared/utils/rotulos.util';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';

@Component({
  selector: 'app-detalhe-paciente',
  imports: [CampoDetalhe, CabecalhoPagina, ConfirmDialog, HistoricoPaciente, TerapiasPaciente, SelectBusca],
  templateUrl: './detalhe-paciente.html',
  styleUrl: './detalhe-paciente.scss'
})
export class DetalhePaciente implements OnInit {
  private avisoSucesso = inject(AvisoSucessoService);
  private route = inject(ActivatedRoute);
  private pacienteService = inject(PacienteService);
  private profissionalService = inject(ProfissionalService);
  private auth = inject(Auth);
  private contexto = lerContextoPacientes(this.route);

  private historico = viewChild(HistoricoPaciente);

  readonly rotuloParentesco = ROTULO_PARENTESCO;
  readonly rotuloEscola = ROTULO_TIPO_ESCOLA;
  readonly cpf = formatarCpf;
  readonly celular = formatarCelular;
  readonly cep = formatarCep;
  readonly cns = formatarCns;
  readonly data = dataCurta;
  readonly rotuloSexo = ROTULO_SEXO;
  readonly rotuloEstadoCivil = ROTULO_ESTADO_CIVIL;

  id = signal(0);
  rotaBase = this.contexto.rotaBase;
  podeEditar = this.auth.temPermissao('EDITAR_PACIENTE');
  podeInativar = this.auth.temPermissao('INATIVAR_PACIENTE');
  podeVerHistorico = this.auth.temPermissao('VISUALIZAR_HISTORICO_PACIENTE');
  podeVerTerapias = this.auth.temPermissao('VISUALIZAR_TERAPIAS');
  // /pacientes -> /terapias.
  rotaTerapias = this.contexto.rotaBase.replace(/\/pacientes$/, '/terapias');

  carregando = signal(true);
  erro = signal('');
  paciente = signal<Paciente | null>(null);

  // Assistentes sociais vinculados (as rotas de vínculo são do assistente social: EDITAR_PROFISSIONAL).
  podeVincular = this.auth.temPermissao('EDITAR_PROFISSIONAL');
  readonly buscarAssistentesSociais = buscaAssistentesSociais(this.profissionalService);
  vinculando = signal(false);
  // Escolha no campo de busca; volta a vazio depois de vincular.
  selecaoAs = signal<number | null>(null);
  erroVinculo = signal('');
  desvinculoPendente = signal<{ idCadastro: number; nome: string } | null>(null);
  idsVinculados = computed(() => this.paciente()?.assistentesSociais.map((a) => a.idCadastro) ?? []);

  // Inativar / reativar
  confirmacaoAberta = signal(false);
  alterandoStatus = signal(false);
  erroStatus = signal('');

  ativo = computed(() => this.paciente()?.pessoa.statusCadastro === 'ATIVO');

  situacao = computed(() => {
    const p = this.paciente();
    if (!p) return '';
    return `${ROTULO_STATUS_PACIENTE[p.statusPaciente]} · Cadastro ${ROTULO_STATUS_CADASTRO[p.pessoa.statusCadastro].toLowerCase()}`;
  });

  dataCadastro = computed(() => dataCurta(this.paciente()?.dataCadastro));

  // Prontuário (atendimento): para o especialista (vê as terapias dele com o paciente) ou para quem
  // vê todas as terapias. Sem isso a aba de terapias do prontuário não teria o que mostrar.
  private podeAbrirProntuario = this.auth.ehEspecialista() || this.podeVerTerapias;
  rotaProntuario = computed(() =>
    this.podeAbrirProntuario && this.paciente() ? `/atendimento/${this.id()}` : ''
  );

  ngOnInit(): void {
    // Recarrega também se só o :id da rota mudar (a tela é reaproveitada pelo roteador).
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
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.status === 404 ? 'Paciente não encontrado.' : mensagemDeErro(err, 'Não foi possível carregar o paciente.'));
        this.carregando.set(false);
      },
    });
  }

  pedirConfirmacao() {
    this.erroStatus.set('');
    this.confirmacaoAberta.set(true);
  }

  confirmarAlteracaoStatus() {
    this.confirmacaoAberta.set(false);
    this.alterandoStatus.set(true);

    const inativando = this.ativo();
    const requisicao: Observable<unknown> = inativando
      ? this.pacienteService.inativar(this.id())
      : this.pacienteService.reativar(this.id());

    requisicao.subscribe({
      next: (resposta) => {
        this.alterandoStatus.set(false);
        const nome = this.paciente()?.pessoa.nome ?? '';
        const terapias = inativando ? resumoInativacaoPaciente(resposta as InativacaoPacienteResponse) : null;
        this.avisoSucesso.mostrar({
          titulo: inativando ? 'Paciente inativado' : 'Paciente reativado',
          detalhe: terapias ? `${nome}: ${terapias}` : nome,
        });
        this.carregar();
        this.historico()?.recarregar();
      },
      error: (err) => {
        this.alterandoStatus.set(false);
        this.erroStatus.set(mensagemDeErro(err, 'Não foi possível alterar a situação do paciente.'));
      },
    });
  }

  // ---------- assistentes sociais ----------

  vincular(idAssistenteSocial: number | string | null) {
    if (idAssistenteSocial === null || this.vinculando()) return;
    this.selecaoAs.set(Number(idAssistenteSocial));
    this.vinculando.set(true);
    this.erroVinculo.set('');
    this.profissionalService.vincularPaciente(Number(idAssistenteSocial), this.id()).subscribe({
      next: (as) => {
        this.vinculando.set(false);
        this.selecaoAs.set(null);
        this.avisoSucesso.mostrar({ titulo: 'Assistente social vinculado', detalhe: as.profissional.pessoa.nome });
        this.carregar();
      },
      error: (err) => {
        this.vinculando.set(false);
        this.selecaoAs.set(null);
        this.erroVinculo.set(mensagemDeErro(err, 'Não foi possível vincular o assistente social.'));
      },
    });
  }

  confirmarDesvinculo() {
    const as = this.desvinculoPendente();
    this.desvinculoPendente.set(null);
    if (!as) return;
    this.vinculando.set(true);
    this.erroVinculo.set('');
    this.profissionalService.desvincularPaciente(as.idCadastro, this.id()).subscribe({
      next: () => {
        this.vinculando.set(false);
        this.avisoSucesso.mostrar({ titulo: 'Vínculo encerrado', detalhe: as.nome });
        this.carregar();
      },
      error: (err) => {
        this.vinculando.set(false);
        this.erroVinculo.set(mensagemDeErro(err, 'Não foi possível encerrar o vínculo.'));
      },
    });
  }
}
