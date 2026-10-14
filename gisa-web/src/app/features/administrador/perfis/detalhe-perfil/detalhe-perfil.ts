import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { FormDialog } from '../../../../shared/components/form-dialog/form-dialog';
import { PerfilDetalhe, Permissao } from '../../../../core/models/perfil.model';
import { PerfilService } from '../../../../core/services/perfil';
import { Auth } from '../../../../core/auth/auth';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { DialogPerfil } from '../dialog-perfil/dialog-perfil';

// GET /perfis/{id}: permissões e usuários do perfil. Toda alteração devolve o perfil atualizado,
// e a tela é redesenhada direto com a resposta.
@Component({
  selector: 'app-detalhe-perfil',
  imports: [CabecalhoPagina, ConfirmDialog, FormDialog, DialogPerfil],
  templateUrl: './detalhe-perfil.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class DetalhePerfil implements OnInit {
  private perfilService = inject(PerfilService);
  private auth = inject(Auth);
  private router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  perfil = signal<PerfilDetalhe | null>(null);
  todasPermissoes = signal<Permissao[]>([]);
  carregando = signal(true);
  erro = signal('');
  erroAcao = signal('');

  // Perfil do próprio usuário logado: mexer nele muda o que ele pode fazer.
  ehMeuPerfil = computed(() => this.auth.usuarioAtual()?.perfil.idPerfil === this.id);

  // Renomear e excluir
  renomeAberto = signal(false);
  exclusaoAberta = signal(false);
  excluindo = signal(false);
  podeExcluir = computed(() => this.perfil()?.usuarios.length === 0);
  mensagemExclusao = computed(() => `O perfil "${this.perfil()?.nome ?? ''}" será excluído definitivamente.`);

  // Adicionar permissões: só as que o perfil ainda não tem.
  adicionarAberto = signal(false);
  paraAdicionar = signal<ReadonlySet<number>>(new Set());
  erroAdicionar = signal('');
  salvandoAdicao = signal(false);
  disponiveis = computed(() => {
    const atuais = new Set(this.perfil()?.permissoes.map((p) => p.idPermissao));
    return this.todasPermissoes().filter((p) => !atuais.has(p.idPermissao));
  });

  // Remover permissão (confirmação só quando é o perfil do próprio usuário).
  removendo = signal<number | null>(null);
  remocaoPendente = signal<Permissao | null>(null);
  mensagemRemocao = computed(
    () =>
      `Este é o seu perfil. Sem "${this.remocaoPendente()?.nome ?? ''}", você pode perder acesso a partes do sistema.`
  );

  ngOnInit() {
    this.perfilService.buscar(this.id).subscribe({
      next: (p) => {
        this.perfil.set(p);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.status === 404 ? 'Perfil não encontrado.' : mensagemDeErro(err, 'Não foi possível carregar o perfil.'));
      },
    });
    this.perfilService.listarPermissoes().subscribe({ next: (lista) => this.todasPermissoes.set(lista) });
  }

  // Aplica a resposta da API e, se for o perfil do usuário logado, atualiza as permissões dele no front.
  private aplicar(p: PerfilDetalhe) {
    this.perfil.set(p);
    if (this.ehMeuPerfil()) this.auth.carregarUsuario().subscribe({ error: () => {} });
  }

  aoRenomear(p: PerfilDetalhe) {
    this.renomeAberto.set(false);
    this.aplicar(p);
  }

  // ---------- adicionar permissões ----------

  abrirAdicionar() {
    this.paraAdicionar.set(new Set());
    this.erroAdicionar.set('');
    this.adicionarAberto.set(true);
  }

  alternar(id: number, marcado: boolean) {
    this.paraAdicionar.update((atual) => {
      const novo = new Set(atual);
      if (marcado) novo.add(id);
      else novo.delete(id);
      return novo;
    });
  }

  confirmarAdicao() {
    const ids = [...this.paraAdicionar()];
    if (!ids.length) {
      this.erroAdicionar.set('Selecione ao menos uma permissão.');
      return;
    }
    this.salvandoAdicao.set(true);
    this.perfilService.adicionarPermissoes(this.id, { permissoesIds: ids }).subscribe({
      next: (p) => {
        this.salvandoAdicao.set(false);
        this.adicionarAberto.set(false);
        this.aplicar(p);
      },
      error: (err) => {
        this.salvandoAdicao.set(false);
        this.erroAdicionar.set(mensagemDeErro(err, 'Não foi possível adicionar as permissões.'));
      },
    });
  }

  // ---------- remover permissão ----------

  pedirRemocao(p: Permissao) {
    if (this.ehMeuPerfil()) this.remocaoPendente.set(p);
    else this.remover(p);
  }

  confirmarRemocao() {
    const p = this.remocaoPendente();
    this.remocaoPendente.set(null);
    if (p) this.remover(p);
  }

  private remover(p: Permissao) {
    this.erroAcao.set('');
    this.removendo.set(p.idPermissao);
    this.perfilService.removerPermissao(this.id, p.idPermissao).subscribe({
      next: (perfil) => {
        this.removendo.set(null);
        this.aplicar(perfil);
      },
      error: (err) => {
        this.removendo.set(null);
        this.erroAcao.set(mensagemDeErro(err, 'Não foi possível remover a permissão.'));
      },
    });
  }

  // ---------- excluir ----------

  excluir() {
    this.exclusaoAberta.set(false);
    this.excluindo.set(true);
    this.erroAcao.set('');
    this.perfilService.excluir(this.id).subscribe({
      next: () => this.router.navigateByUrl('/administrador/perfis'),
      error: (err) => {
        this.excluindo.set(false);
        this.erroAcao.set(mensagemDeErro(err, 'Não foi possível excluir o perfil.'));
      },
    });
  }
}
