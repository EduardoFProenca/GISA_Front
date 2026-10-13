import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { Paciente } from '../../../core/models/paciente.model';
import { PacienteService } from '../../../core/services/paciente';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { lerContextoPacientes } from '../contexto-pacientes';
import { dadosPessoaisDe, enderecoParaForm } from '../paciente-form.util';
import { HistoricoPaciente } from './historico-paciente/historico-paciente';
import { TerapiasPaciente } from './terapias-paciente/terapias-paciente';
import { formatarCelular, formatarCpf } from '../../../shared/utils/formatacao.util';
import { dataCurta } from '../../../shared/utils/data.util';
import {
  ROTULO_PARENTESCO,
  ROTULO_STATUS_CADASTRO,
  ROTULO_STATUS_PACIENTE,
  ROTULO_TIPO_ESCOLA,
} from '../../../shared/utils/rotulos.util';

@Component({
  selector: 'app-detalhe-paciente',
  imports: [CabecalhoPagina, ConfirmDialog, DadosPessoais, Contato, HistoricoPaciente, TerapiasPaciente],
  templateUrl: './detalhe-paciente.html',
  styleUrl: './detalhe-paciente.scss'
})
export class DetalhePaciente implements OnInit {
  private route = inject(ActivatedRoute);
  private pacienteService = inject(PacienteService);
  private auth = inject(Auth);
  private contexto = lerContextoPacientes(this.route);

  private historico = viewChild(HistoricoPaciente);

  readonly rotuloParentesco = ROTULO_PARENTESCO;
  readonly rotuloEscola = ROTULO_TIPO_ESCOLA;
  readonly cpf = formatarCpf;
  readonly celular = formatarCelular;

  id = signal(0);
  rotaBase = this.contexto.rotaBase;
  podeEditar = !this.contexto.somenteLeitura && this.auth.temPermissao('EDITAR_PACIENTE');
  podeInativar = !this.contexto.somenteLeitura && this.auth.temPermissao('INATIVAR_PACIENTE');
  podeVerHistorico = this.auth.temPermissao('VISUALIZAR_HISTORICO_PACIENTE');
  podeVerTerapias = this.auth.temPermissao('VISUALIZAR_TERAPIAS');
  // /administrador/pacientes -> /administrador/terapias. No painel só leitura não há telas de terapia.
  rotaTerapias = this.contexto.somenteLeitura ? '' : this.contexto.rotaBase.replace(/\/pacientes$/, '/terapias');

  carregando = signal(true);
  erro = signal('');
  paciente = signal<Paciente | null>(null);

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
  dadosPessoais = computed(() => {
    const p = this.paciente();
    return p ? dadosPessoaisDe(p.pessoa) : {};
  });
  contato = computed(() => enderecoParaForm(this.paciente()?.pessoa.enderecos[0]));

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

    const requisicao: Observable<unknown> = this.ativo()
      ? this.pacienteService.inativar(this.id())
      : this.pacienteService.reativar(this.id());

    requisicao.subscribe({
      next: () => {
        this.alterandoStatus.set(false);
        this.carregar();
        this.historico()?.recarregar();
      },
      error: (err) => {
        this.alterandoStatus.set(false);
        this.erroStatus.set(mensagemDeErro(err, 'Não foi possível alterar a situação do paciente.'));
      },
    });
  }
}
