import { CampoDetalhe } from '../../../../shared/components/campo-detalhe/campo-detalhe';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Cbo, CboDetalhe } from '../../../../core/models/cargo.model';
import { CargoService } from '../../../../core/services/cargo';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { DialogCbo } from '../dialog-cbo/dialog-cbo';
import { formatarCbo } from '../../../../shared/utils/formatacao.util';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';

// GET /cbos/{codigo}: título e cargos que usam o CBO.
@Component({
  selector: 'app-detalhe-cbo',
  imports: [CampoDetalhe, RouterLink, CabecalhoPagina, ConfirmDialog, DialogCbo],
  templateUrl: './detalhe-cbo.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class DetalheCbo implements OnInit {
  private avisoSucesso = inject(AvisoSucessoService);
  private cargoService = inject(CargoService);
  private router = inject(Router);
  readonly codigoCbo = inject(ActivatedRoute).snapshot.paramMap.get('codigo') ?? '';

  readonly codigo = formatarCbo;

  cbo = signal<CboDetalhe | null>(null);
  carregando = signal(true);
  erro = signal('');
  erroAcao = signal('');

  edicaoAberta = signal(false);
  exclusaoAberta = signal(false);
  excluindo = signal(false);

  // A API só exclui CBO sem cargos.
  podeExcluir = computed(() => this.cbo()?.cargos.length === 0);
  mensagemExclusao = computed(() => {
    const c = this.cbo();
    return c ? `O CBO ${formatarCbo(c.codigoCBO)} (${c.tituloCBO}) será excluído definitivamente.` : '';
  });

  ngOnInit() {
    this.cargoService.buscarCbo(this.codigoCbo).subscribe({
      next: (c) => {
        this.cbo.set(c);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.status === 404 ? 'CBO não encontrado.' : mensagemDeErro(err, 'Não foi possível carregar o CBO.'));
      },
    });
  }

  // O PATCH devolve só código e título: mantém a lista de cargos.
  aoSalvar(atualizado: Cbo) {
    this.edicaoAberta.set(false);
    this.cbo.update((c) => (c ? { ...c, tituloCBO: atualizado.tituloCBO } : c));
  }

  excluir() {
    this.exclusaoAberta.set(false);
    this.excluindo.set(true);
    this.erroAcao.set('');
    this.cargoService.excluirCbo(this.codigoCbo).subscribe({
      next: () => {
        this.avisoSucesso.mostrar({ titulo: 'CBO excluído', detalhe: this.cbo()?.tituloCBO });
        this.router.navigateByUrl('/administrador/cbos');
      },
      error: (err) => {
        this.excluindo.set(false);
        this.erroAcao.set(mensagemDeErro(err, 'Não foi possível excluir o CBO.'));
      },
    });
  }
}
