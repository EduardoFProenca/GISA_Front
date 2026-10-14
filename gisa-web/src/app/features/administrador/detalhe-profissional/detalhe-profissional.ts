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
import { formatarCelular, formatarCep, formatarCnpj, formatarCpf } from '../../../shared/utils/formatacao.util';
import { dataCurta, horaCurta } from '../../../shared/utils/data.util';
import { ROTULO_DIA_SEMANA, ROTULO_ESTADO_CIVIL, ROTULO_SEXO } from '../../../shared/utils/rotulos.util';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';

const ROTULO_TIPO: Record<TipoProfissional, string> = {
  PROFISSIONAL: 'Profissional',
  ESPECIALISTA: 'Especialista',
  ESPECIALISTA_PJ: 'Especialista PJ',
};

@Component({
  selector: 'app-detalhe-profissional',
  imports: [
    FormsModule,
    CabecalhoPagina,
    ConfirmDialog,
    FormDialog,
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

  // Conceder acesso / redefinir senha
  dialogo = signal<'acesso' | 'senha' | null>(null);
  salvandoDialogo = signal(false);
  erroDialogo = signal('');
  senha = '';
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

  // ---------- Conceder acesso / redefinir senha ----------

  abrirDialogo(tipo: 'acesso' | 'senha') {
    this.senha = '';
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
    const tipo = this.dialogo();
    if (this.senha.length < 8 || this.senha.length > 30) {
      this.erroDialogo.set('A senha deve ter entre 8 e 30 caracteres.');
      return;
    }
    if (tipo === 'acesso' && !this.perfilAcesso) {
      this.erroDialogo.set('Selecione o perfil.');
      return;
    }

    this.salvandoDialogo.set(true);
    this.erroDialogo.set('');

    const req: Observable<unknown> =
      tipo === 'acesso'
        ? this.profissionalService.concederAcesso(this.id, this.tipo(), {
            senha: this.senha,
            idPerfil: Number(this.perfilAcesso),
          })
        : this.usuarioService.redefinirSenha(this.id, { novaSenha: this.senha });

    req.subscribe({
      next: () => {
        this.salvandoDialogo.set(false);
        this.dialogo.set(null);
        this.avisoSucesso.mostrar(
          tipo === 'acesso'
            ? { titulo: 'Acesso concedido', detalhe: 'O login é feito com o CPF e a senha informada.' }
            : { titulo: 'Senha redefinida', detalhe: 'As sessões abertas desse usuário foram encerradas.' }
        );
        if (tipo === 'acesso') this.carregar();
      },
      error: (err) => {
        this.salvandoDialogo.set(false);
        this.erroDialogo.set(mensagemDeErro(err, 'Não foi possível salvar.'));
      },
    });
  }
}
