import { CampoDetalhe } from '../../../shared/components/campo-detalhe/campo-detalhe';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { FormDialog } from '../../../shared/components/form-dialog/form-dialog';
import { Perfil } from '../../../core/models/perfil.model';
import { PerfilService } from '../../../core/services/perfil';
import { ProfissionalService, tipoDoDetalhe } from '../../../core/services/profissional';
import { UsuarioService } from '../../../core/services/usuario';
import { ProfissionalDetalhe, TipoProfissional } from '../../../core/models/profissional.model';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { formatarCbo, formatarCelular, formatarCep, formatarCnpj, formatarCns, formatarCpf } from '../../../shared/utils/formatacao.util';
import { dataCurta, horaCurta } from '../../../shared/utils/data.util';
import { ROTULO_DIA_SEMANA, ROTULO_ESTADO_CIVIL, ROTULO_SEXO } from '../../../shared/utils/rotulos.util';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { PacienteService } from '../../../core/services/paciente';
import { PacienteResumo } from '../../../core/models/paciente.model';
import { SelectBusca } from '../../../shared/components/select-busca/select-busca';
import { buscaPacientes, DICA_BUSCA_PACIENTE } from '../../../shared/components/select-busca/buscas';

const ROTULO_TIPO: Record<TipoProfissional, string> = {
  PROFISSIONAL: 'Profissional',
  ESPECIALISTA: 'Especialista',
  ESPECIALISTA_PJ: 'Especialista PJ',
  ASSISTENTE_SOCIAL: 'Assistente Social',
};

@Component({
  selector: 'app-detalhe-profissional',
  imports: [CampoDetalhe, 
    FormsModule,
    CabecalhoPagina,
    ConfirmDialog,
    FormDialog,
    SelectBusca,
  ],
  templateUrl: './detalhe-profissional.html',
  styleUrl: './detalhe-profissional.scss',
})
export class DetalheProfissional implements OnInit {
  private avisoSucesso = inject(AvisoSucessoService);
  private route = inject(ActivatedRoute);
  private profissionalService = inject(ProfissionalService);
  private usuarioService = inject(UsuarioService);
  private perfilService = inject(PerfilService);
  private auth = inject(Auth);

  id = Number(this.route.snapshot.paramMap.get('id'));

  podeEditar = this.auth.temPermissao('EDITAR_PROFISSIONAL');
  podeInativar = this.auth.temPermissao('INATIVAR_PROFISSIONAL');
  podeGerenciarUsuarios = this.auth.temPermissao('GERENCIAR_USUARIOS');

  readonly cpf = formatarCpf;
  readonly cnpj = formatarCnpj;
  readonly cbo = formatarCbo;
  readonly cns = formatarCns;
  readonly celular = formatarCelular;
  readonly cep = formatarCep;
  readonly data = dataCurta;
  readonly hora = horaCurta;
  readonly rotuloSexo = ROTULO_SEXO;
  readonly rotuloEstadoCivil = ROTULO_ESTADO_CIVIL;
  readonly rotuloDia = ROTULO_DIA_SEMANA;

  carregando = signal(true);
  erro = signal('');
  detalhe = signal<ProfissionalDetalhe | null>(null);
  // Perfis do select "Conceder acesso": carregados só quando o diálogo abre.
  perfis = signal<Perfil[]>([]);

  tipo = computed(() => {
    const d = this.detalhe();
    return d ? tipoDoDetalhe(d) : 'PROFISSIONAL';
  });
  rotuloTipo = computed(() => ROTULO_TIPO[this.tipo()]);
  ativo = computed(() => this.detalhe()?.profissional.pessoa.statusCadastro === 'ATIVO');
  usuario = computed(() => this.detalhe()?.profissional.usuario ?? null);

  // Inativar / reativar
  confirmacaoAberta = signal(false);
  alterandoStatus = signal(false);
  erroStatus = signal('');

  // Pacientes vinculados (só assistente social; EDITAR_PROFISSIONAL).
  readonly buscarPacientes = buscaPacientes(inject(PacienteService));
  readonly dicaBuscaPaciente = DICA_BUSCA_PACIENTE;
  vinculando = signal(false);
  erroVinculo = signal('');
  // Escolha no campo de busca; volta a vazio depois de vincular.
  selecaoPaciente = signal<number | null>(null);
  desvinculoPendente = signal<PacienteResumo | null>(null);
  idsPacientesVinculados = computed(() => this.detalhe()?.assistenteSocial?.pacientes.map((p) => p.idCadastro) ?? []);

  // Conceder acesso / nova senha temporária
  dialogo = signal<'acesso' | 'senha' | null>(null);
  salvandoDialogo = signal(false);
  erroDialogo = signal('');
  perfilAcesso = '';

  ngOnInit() {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.erro.set('Profissional inválido.');
      this.carregando.set(false);
      return;
    }
    this.carregar();
  }

  private carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.profissionalService.buscarDetalhe(this.id)
      .subscribe({
        next: (detalhe) => {
          this.detalhe.set(detalhe);
          this.carregando.set(false);
        },
        error: (err) => {
          this.erro.set(err?.status === 404 ? 'Profissional não encontrado.' : mensagemDeErro(err, 'Não foi possível carregar o profissional.'));
          this.carregando.set(false);
        },
      });
  }

  // ---------- Inativar / reativar ----------

  confirmarAlteracaoStatus() {
    this.confirmacaoAberta.set(false);
    this.alterandoStatus.set(true);
    this.erroStatus.set('');

    const inativando = this.ativo();
    const req: Observable<unknown> = inativando
      ? this.profissionalService.inativar(this.id, this.tipo())
      : this.profissionalService.reativar(this.id, this.tipo());

    req.subscribe({
      next: () => {
        this.alterandoStatus.set(false);
        this.avisoSucesso.mostrar({
          titulo: inativando ? 'Profissional inativado' : 'Profissional reativado',
          detalhe: this.detalhe()?.profissional.pessoa.nome,
        });
        this.carregar();
      },
      error: (err) => {
        this.alterandoStatus.set(false);
        this.erroStatus.set(mensagemDeErro(err, 'Não foi possível alterar a situação do profissional.'));
      },
    });
  }

  // ---------- Pacientes vinculados (assistente social) ----------
  // As rotas de vínculo devolvem o assistente social atualizado (vincular) ou 204 (desvincular).

  vincularPaciente(idPaciente: number | string | null) {
    if (idPaciente === null || this.vinculando()) return;
    this.selecaoPaciente.set(Number(idPaciente));
    this.vinculando.set(true);
    this.erroVinculo.set('');
    this.profissionalService.vincularPaciente(this.id, Number(idPaciente)).subscribe({
      next: (assistenteSocial) => {
        this.vinculando.set(false);
        this.selecaoPaciente.set(null);
        this.detalhe.update((d) => (d ? { ...d, assistenteSocial } : d));
        const nome = assistenteSocial.pacientes.find((p) => p.idCadastro === Number(idPaciente))?.nome;
        this.avisoSucesso.mostrar({ titulo: 'Paciente vinculado', detalhe: nome });
      },
      error: (err) => {
        this.vinculando.set(false);
        this.selecaoPaciente.set(null);
        this.erroVinculo.set(mensagemDeErro(err, 'Não foi possível vincular o paciente.'));
      },
    });
  }

  confirmarDesvinculo() {
    const paciente = this.desvinculoPendente();
    this.desvinculoPendente.set(null);
    if (!paciente) return;
    this.vinculando.set(true);
    this.erroVinculo.set('');
    this.profissionalService.desvincularPaciente(this.id, paciente.idCadastro).subscribe({
      next: () => {
        this.vinculando.set(false);
        this.detalhe.update((d) =>
          d?.assistenteSocial
            ? { ...d, assistenteSocial: { ...d.assistenteSocial, pacientes: d.assistenteSocial.pacientes.filter((p) => p.idCadastro !== paciente.idCadastro) } }
            : d
        );
        this.avisoSucesso.mostrar({ titulo: 'Vínculo encerrado', detalhe: paciente.nome });
      },
      error: (err) => {
        this.vinculando.set(false);
        this.erroVinculo.set(mensagemDeErro(err, 'Não foi possível encerrar o vínculo.'));
      },
    });
  }

  // ---------- Conceder acesso / nova senha temporária ----------
  // A senha nunca é digitada: o back gera uma temporária (7 dias) e a envia ao e-mail do cadastro.

  abrirDialogo(tipo: 'acesso' | 'senha') {
    this.perfilAcesso = '';
    this.erroDialogo.set('');
    this.dialogo.set(tipo);
    if (tipo === 'acesso' && !this.perfis().length) {
      this.perfilService.listar().subscribe({
        next: (lista) => this.perfis.set(lista),
        error: (err) => this.erroDialogo.set(mensagemDeErro(err, 'Não foi possível carregar os perfis.')),
      });
    }
  }

  confirmarDialogo() {
    if (this.salvandoDialogo()) return;
    const tipo = this.dialogo();
    if (tipo === 'acesso' && !this.perfilAcesso) {
      this.erroDialogo.set('Selecione o perfil.');
      return;
    }

    this.salvandoDialogo.set(true);
    this.erroDialogo.set('');
    const email = this.detalhe()?.profissional.email ?? 'o e-mail do cadastro';

    if (tipo === 'acesso') {
      this.profissionalService.concederAcesso(this.id, this.tipo(), { idPerfil: Number(this.perfilAcesso) }).subscribe({
        next: (res) => {
          this.salvandoDialogo.set(false);
          this.dialogo.set(null);
          this.carregar();
          if (res.emailEnviado) {
            this.avisoSucesso.mostrar({ titulo: 'Acesso concedido', detalhe: `A senha temporária foi enviada para ${email}.` });
          } else {
            this.avisarEmailNaoEnviado('Acesso concedido, mas o e-mail não foi enviado');
          }
        },
        error: (err) => {
          this.salvandoDialogo.set(false);
          this.erroDialogo.set(mensagemDeErro(err, 'Não foi possível conceder o acesso.'));
        },
      });
      return;
    }

    this.usuarioService.enviarSenhaTemporaria(this.id).subscribe({
      next: () => {
        this.salvandoDialogo.set(false);
        this.dialogo.set(null);
        this.avisoSucesso.mostrar({
          titulo: 'Senha temporária enviada',
          detalhe: `Enviada para ${email}. As sessões abertas desse usuário foram encerradas.`,
        });
      },
      error: (err) => {
        this.salvandoDialogo.set(false);
        // 503: o e-mail não saiu e nada foi alterado.
        this.erroDialogo.set(mensagemDeErro(err, 'Não foi possível enviar a nova senha temporária.'));
      },
    });
  }

  // O acesso existe, mas a pessoa não recebeu a senha: oferece o reenvio.
  private avisarEmailNaoEnviado(titulo: string) {
    this.avisoSucesso.mostrar({
      titulo,
      detalhe: 'A pessoa ainda não recebeu a senha temporária. Tente reenviar agora ou mais tarde, pelo botão "Enviar nova senha temporária".',
      acoes: [
        { texto: 'Depois', acao: () => undefined },
        { texto: 'Reenviar agora', primaria: true, acao: () => this.abrirDialogo('senha') },
      ],
    });
  }
}
