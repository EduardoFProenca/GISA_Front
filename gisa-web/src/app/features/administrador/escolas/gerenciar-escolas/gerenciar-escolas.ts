import { Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Subject, catchError, of, switchMap, tap, timer } from 'rxjs';
import { ICONES } from '../../../../shared/icons';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../../shared/components/paginacao/paginacao';
import { Escola, EscolaDetalhe, TipoEscola } from '../../../../core/models/escola.model';
import { Pagina } from '../../../../core/models/comum.model';
import { EscolaService } from '../../../../core/services/escola';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { ROTULO_TIPO_ESCOLA } from '../../../../shared/utils/rotulos.util';
import { formatarCelular } from '../../../../shared/utils/formatacao.util';
import { DialogEscola } from '../dialog-escola/dialog-escola';

const PAGINA_VAZIA: Pagina<EscolaDetalhe> = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 9 };

// GET /escolas (paginado, 9 por página, por nome), com busca por nome e filtro de tipo.
@Component({
  selector: 'app-gerenciar-escolas',
  imports: [NgIcon, FormsModule, RouterLink, CabecalhoPagina, Paginacao, DialogEscola],
  templateUrl: './gerenciar-escolas.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class GerenciarEscolas implements OnInit {
  readonly icones = ICONES;
  private escolaService = inject(EscolaService);
  private router = inject(Router);

  readonly rotuloTipo = ROTULO_TIPO_ESCOLA;
  readonly tipos = Object.keys(ROTULO_TIPO_ESCOLA) as TipoEscola[];
  readonly telefone = formatarCelular;
  readonly itensPorPagina = 9;

  termo = '';
  tipo: TipoEscola | '' = '';
  paginaAtual = signal(1);

  pagina = signal<Pagina<EscolaDetalhe>>(PAGINA_VAZIA);
  carregando = signal(true);
  erro = signal('');
  dialogAberto = signal(false);

  // A digitação espera 300 ms; select e paginação carregam na hora.
  private busca$ = new Subject<{ atraso: number }>();

  constructor() {
    this.busca$
      .pipe(
        // switchMap descarta o timer anterior: só a última digitação dispara a busca.
        switchMap(({ atraso }) => timer(atraso)),
        tap(() => {
          this.carregando.set(true);
          this.erro.set('');
        }),
        switchMap(() =>
          this.escolaService
            .listar({
              page: this.paginaAtual() - 1,
              size: this.itensPorPagina,
              nome: this.termo.trim() || undefined,
              tipoEscola: this.tipo || undefined,
            })
            .pipe(
              catchError((err) => {
                this.erro.set(mensagemDeErro(err, 'Não foi possível carregar as escolas.'));
                return of(PAGINA_VAZIA);
              })
            )
        ),
        takeUntilDestroyed()
      )
      .subscribe((p) => {
        this.pagina.set(p);
        this.carregando.set(false);
      });
  }

  ngOnInit() {
    this.busca$.next({ atraso: 0 });
  }

  aoDigitar() {
    this.paginaAtual.set(1);
    this.busca$.next({ atraso: 300 });
  }

  aoFiltrar() {
    this.paginaAtual.set(1);
    this.busca$.next({ atraso: 0 });
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.busca$.next({ atraso: 0 });
  }

  aoSalvar(escola: Escola) {
    this.dialogAberto.set(false);
    this.router.navigate(['/administrador/escolas', escola.idEscola]);
  }
}
