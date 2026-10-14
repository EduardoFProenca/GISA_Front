import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Cargo, CargoDetalhe } from '../../../../core/models/cargo.model';
import { CargoService } from '../../../../core/services/cargo';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { DialogCargo } from '../dialog-cargo/dialog-cargo';
import { formatarCodigoCbo } from '../cbo.util';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';

// GET /cargos/{id}: CBO e profissionais do cargo (ativos e inativos).
@Component({
  selector: 'app-detalhe-cargo',
  imports: [RouterLink, CabecalhoPagina, ConfirmDialog, DialogCargo],
  templateUrl: './detalhe-cargo.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class DetalheCargo implements OnInit {
  private avisoSucesso = inject(AvisoSucessoService);
  private cargoService = inject(CargoService);
  private router = inject(Router);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly codigo = formatarCodigoCbo;

  cargo = signal<CargoDetalhe | null>(null);
  carregando = signal(true);
  erro = signal('');
  erroAcao = signal('');

  edicaoAberta = signal(false);
  exclusaoAberta = signal(false);
  excluindo = signal(false);

  // A API só exclui cargo sem profissionais (nem inativos).
  podeExcluir = computed(() => this.cargo()?.profissionais.length === 0);
  mensagemExclusao = computed(() => `O cargo "${this.cargo()?.nome ?? ''}" será excluído definitivamente.`);

  ngOnInit() {
    this.cargoService.buscar(this.id).subscribe({
      next: (c) => {
        this.cargo.set(c);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.status === 404 ? 'Cargo não encontrado.' : mensagemDeErro(err, 'Não foi possível carregar o cargo.'));
      },
    });
  }

  // O PATCH devolve os detalhes completos.
  aoSalvar(c: Cargo) {
    this.edicaoAberta.set(false);
    this.cargo.set(c as CargoDetalhe);
  }

  excluir() {
    this.exclusaoAberta.set(false);
    this.excluindo.set(true);
    this.erroAcao.set('');
    this.cargoService.excluir(this.id).subscribe({
      next: () => {
        this.avisoSucesso.mostrar({ titulo: 'Cargo excluído', detalhe: this.cargo()?.nome });
        this.router.navigateByUrl('/administrador/cargos');
      },
      error: (err) => {
        this.excluindo.set(false);
        this.erroAcao.set(mensagemDeErro(err, 'Não foi possível excluir o cargo.'));
      },
    });
  }
}
