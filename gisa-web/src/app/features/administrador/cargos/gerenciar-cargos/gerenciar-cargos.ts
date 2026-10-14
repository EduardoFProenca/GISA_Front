import { Component, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ICONES } from '../../../../shared/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, startWith, switchMap, tap } from 'rxjs';
import { CabecalhoPagina } from '../../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Cargo } from '../../../../core/models/cargo.model';
import { CargoService } from '../../../../core/services/cargo';
import { mensagemDeErro } from '../../../../core/http/erro-api';
import { DialogCargo } from '../dialog-cargo/dialog-cargo';
import { formatarCbo } from '../../../../shared/utils/formatacao.util';

// GET /cargos (sem paginação, ordenado por nome), com busca por trecho do nome.
@Component({
  selector: 'app-gerenciar-cargos',
  imports: [NgIcon, FormsModule, RouterLink, CabecalhoPagina, DialogCargo],
  templateUrl: './gerenciar-cargos.html',
  styleUrl: '../../tabelas-apoio.scss',
})
export class GerenciarCargos {
  readonly icones = ICONES;
  private cargoService = inject(CargoService);
  private router = inject(Router);

  readonly codigo = formatarCbo;

  termo = '';
  cargos = signal<Cargo[]>([]);
  carregando = signal(true);
  erro = signal('');
  dialogAberto = signal(false);

  private busca$ = new Subject<string>();

  constructor() {
    this.busca$
      .pipe(
        debounceTime(300),
        startWith(''),
        distinctUntilChanged(),
        tap(() => {
          this.carregando.set(true);
          this.erro.set('');
        }),
        // Erro tratado aqui dentro para a busca continuar funcionando depois de uma falha.
        switchMap((nome) =>
          this.cargoService.listar(nome.trim() || undefined).pipe(
            catchError((err) => {
              this.erro.set(mensagemDeErro(err, 'Não foi possível carregar os cargos.'));
              return of([] as Cargo[]);
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((lista) => {
        this.cargos.set(lista);
        this.carregando.set(false);
      });
  }

  buscar(termo: string) {
    this.busca$.next(termo);
  }

  aoSalvar(cargo: Cargo) {
    this.dialogAberto.set(false);
    this.router.navigate(['/administrador/cargos', cargo.idCargo]);
  }
}
