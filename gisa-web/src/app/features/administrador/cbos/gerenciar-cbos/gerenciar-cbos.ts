import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, catchError, of, startWith, switchMap, tap, timer } from 'rxjs';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../../shared/components/paginacao/paginacao';
import { Cbo } from '../../../../core/models/cargo.model';
import { Pagina } from '../../../../core/models/comum.model';
import { CargoService } from '../../../../core/services/cargo';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { DialogCbo } from '../dialog-cbo/dialog-cbo';
import { filtroDeBuscaCbo, formatarCodigoCbo } from '../../cargos/cbo.util';

const ORDENACOES = [
  { valor: 'codigoCBO,asc', label: 'Por código' },
  { valor: 'tituloCBO,asc', label: 'Por título' },
];

// GET /cbos (paginado). Uma busca só: números = início do código; texto = trecho do título.
@Component({
  selector: 'app-gerenciar-cbos',
  imports: [FormsModule, RouterLink, CabecalhoPagina, Paginacao, DialogCbo],
  templateUrl: './gerenciar-cbos.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class GerenciarCbos {
  private cargoService = inject(CargoService);
  private router = inject(Router);

  readonly codigo = formatarCodigoCbo;
  readonly ordenacoes = ORDENACOES;
  readonly itensPorPagina = 10;

  termo = '';
  ordenacao = ORDENACOES[0].valor;
  paginaAtual = signal(1);
  cbos = signal<Cbo[]>([]);
  total = signal(0);
  carregando = signal(true);
  erro = signal('');
  dialogAberto = signal(false);

  private recarregar$ = new Subject<number>(); // valor = atraso (debounce) em ms

  constructor() {
    this.recarregar$
      .pipe(
        startWith(0),
        // Digitação espera (o switchMap descarta o timer anterior); página/ordenação é imediata.
        switchMap((atraso) => timer(atraso)),
        tap(() => {
          this.carregando.set(true);
          this.erro.set('');
        }),
        switchMap(() =>
          this.cargoService
            .listarCbos({
              ...filtroDeBuscaCbo(this.termo),
              page: this.paginaAtual() - 1,
              size: this.itensPorPagina,
              sort: this.ordenacao,
            })
            .pipe(
              catchError((err) => {
                this.erro.set(mensagemDeErro(err, 'Não foi possível carregar os CBOs.'));
                return of<Pagina<Cbo>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 });
              })
            )
        ),
        takeUntilDestroyed()
      )
      .subscribe((p) => {
        this.cbos.set(p.content);
        this.total.set(p.totalElements);
        this.carregando.set(false);
      });
  }

  buscar() {
    this.paginaAtual.set(1);
    this.recarregar$.next(300);
  }

  ordenar() {
    this.paginaAtual.set(1);
    this.recarregar$.next(0);
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.recarregar$.next(0);
  }

  aoSalvar(cbo: Cbo) {
    this.dialogAberto.set(false);
    this.router.navigate(['/administrador/cbos', cbo.codigoCBO]);
  }
}
