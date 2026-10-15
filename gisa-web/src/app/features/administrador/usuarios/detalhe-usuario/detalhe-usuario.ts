import { CampoDetalhe } from '../../../../shared/components/campo-detalhe/campo-detalhe';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { UsuarioDetalhe } from '../../../../core/models/auth.model';
import { Perfil } from '../../../../core/models/perfil.model';
import { UsuarioService } from '../../../../core/services/usuario';
import { PerfilService } from '../../../../core/services/perfil';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';
import { Auth } from '../../../../core/auth/auth';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { ROTULO_TIPO_CADASTRO } from '../../../../shared/utils/rotulos.util';
import { formatarCpf } from '../../../../shared/utils/formatacao.util';

// GET /usuarios/{idCadastro}: perfil, permissões e as ações de trocar perfil, redefinir senha e retirar acesso.
// As travas (próprio acesso, último administrador ativo) são da API; aqui só evitamos o caso óbvio.
@Component({
  selector: 'app-detalhe-usuario',
  imports: [CampoDetalhe, FormsModule, RouterLink, CabecalhoPagina, ConfirmDialog, FormDialog],
  templateUrl: './detalhe-usuario.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class DetalheUsuario implements OnInit {
  private usuarioService = inject(UsuarioService);
  private perfilService = inject(PerfilService);
  private avisoSucesso = inject(AvisoSucessoService);
  private auth = inject(Auth);
  private router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly cpf = formatarCpf;
  readonly rotuloTipo = ROTULO_TIPO_CADASTRO;
  readonly podeVerCadastro = this.auth.temPermissao('VISUALIZAR_PROFISSIONAIS');
  readonly podeVerPerfis = this.auth.temPermissao('GERENCIAR_PERFIS');
  readonly ehVoceMesmo = this.auth.usuarioAtual()?.idCadastro === this.id;

  usuario = signal<UsuarioDetalhe | null>(null);
  perfis = signal<Perfil[]>([]);
  carregando = signal(true);
  erro = signal('');

  // Diálogos
  dialogo = signal<'perfil' | 'senha' | null>(null);
  idPerfil = '';
  salvando = signal(false);
  erroDialogo = signal('');

  retiradaAberta = signal(false);
  retirando = signal(false);
  erroAcao = signal('');

  mensagemRetirada = computed(
    () =>
      `${this.usuario()?.nome ?? ''} não poderá mais entrar no sistema e as sessões abertas serão encerradas. ` +
      'O cadastro continua como está, e o acesso pode ser concedido de novo depois.'
  );

  ngOnInit() {
    this.usuarioService.buscar(this.id).subscribe({
      next: (u) => {
        this.usuario.set(u);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.status === 404 ? mensagemDeErro(err, 'Usuário não encontrado.') : mensagemDeErro(err, 'Não foi possível carregar o usuário.'));
      },
    });
    this.perfilService.listar().subscribe({ next: (p) => this.perfis.set(p), error: () => undefined });
  }

  abrirDialogo(tipo: 'perfil' | 'senha') {
    this.idPerfil = String(this.usuario()?.perfil.idPerfil ?? '');
    this.erroDialogo.set('');
    this.dialogo.set(tipo);
  }

  confirmarDialogo() {
    if (this.salvando()) return;
    if (this.dialogo() === 'perfil') this.trocarPerfil();
    else this.enviarSenhaTemporaria();
  }

  private trocarPerfil() {
    const atual = this.usuario();
    if (!this.idPerfil) {
      this.erroDialogo.set('Selecione o perfil.');
      return;
    }
    if (Number(this.idPerfil) === atual?.perfil.idPerfil) {
      this.dialogo.set(null);
      return;
    }
    this.salvando.set(true);
    this.erroDialogo.set('');
    this.usuarioService.trocarPerfil(this.id, Number(this.idPerfil)).subscribe({
      next: (u) => {
        this.salvando.set(false);
        this.dialogo.set(null);
        this.usuario.set(u);
        this.avisoSucesso.mostrar({ titulo: 'Perfil alterado', detalhe: `${u.nome} agora é ${u.perfil.nome}.` });
        // O próprio perfil mudou: recarrega as permissões de quem está logado.
        if (this.ehVoceMesmo) this.auth.carregarUsuario().subscribe({ error: () => undefined });
      },
      error: (err) => {
        this.salvando.set(false);
        this.erroDialogo.set(mensagemDeErro(err, 'Não foi possível trocar o perfil.'));
      },
    });
  }

  // 503 = o e-mail não saiu e nada foi alterado (a senha anterior continua valendo).
  private enviarSenhaTemporaria() {
    this.salvando.set(true);
    this.erroDialogo.set('');
    this.usuarioService.enviarSenhaTemporaria(this.id).subscribe({
      next: () => {
        this.salvando.set(false);
        this.dialogo.set(null);
        this.avisoSucesso.mostrar({
          titulo: 'Senha temporária enviada',
          detalhe: `Enviada para ${this.usuario()?.email ?? 'o e-mail do usuário'}. As sessões abertas foram encerradas.`,
        });
      },
      error: (err) => {
        this.salvando.set(false);
        this.erroDialogo.set(mensagemDeErro(err, 'Não foi possível enviar a nova senha temporária.'));
      },
    });
  }

  retirarAcesso() {
    this.retiradaAberta.set(false);
    this.retirando.set(true);
    this.erroAcao.set('');
    this.usuarioService.retirarAcesso(this.id).subscribe({
      next: () => {
        this.avisoSucesso.mostrar({ titulo: 'Acesso retirado', detalhe: this.usuario()?.nome });
        this.router.navigateByUrl('/administrador/usuarios');
      },
      error: (err) => {
        this.retirando.set(false);
        this.erroAcao.set(mensagemDeErro(err, 'Não foi possível retirar o acesso.'));
      },
    });
  }
}
