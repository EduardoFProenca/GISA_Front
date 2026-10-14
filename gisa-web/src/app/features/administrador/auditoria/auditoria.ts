import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, of, startWith, switchMap, tap, timer } from 'rxjs';
import { AcaoAuditoria, RegistroAuditoria } from '../../../core/models/auditoria.model';
import { Pagina } from '../../../core/models/comum.model';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { AuditoriaService } from '../../../core/services/auditoria';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { Mascara } from '../../../shared/directives/mascara.directive';
import { dataHoraLocal } from '../../../shared/utils/data.util';
import { formatarCpf } from '../../../shared/utils/formatacao.util';
import { soDigitos } from '../../../shared/utils/texto.util';
import { CATEGORIAS, ROTULO_ACAO, descreverCaminho } from './auditoria.util';

const POR_PAGINA = 20;

// Trilha de auditoria (GET /auditoria): quem fez o quê, quando e com qual resultado.
// Categorias = valores de `acao`; filtros por início do CPF e período (dias incluídos).
@Component({
  selector: 'app-auditoria',
  imports: [FormsModule, Mascara, CabecalhoPagina, Paginacao],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria {
  private auditoriaService = inject(AuditoriaService);

  readonly categorias = CATEGORIAS;
  readonly rotuloAcao = ROTULO_ACAO;
  readonly porPagina = POR_PAGINA;
  readonly dataHora = dataHoraLocal;
  readonly cpf = formatarCpf;
  readonly descrever = descreverCaminho;

  // Filtros
  acao = signal<AcaoAuditoria | null>(null);
  cpfFiltro = '';
  inicio = '';
  fim = '';
  erroPeriodo = signal('');
  paginaAtual = signal(1);

  // Resultado
  registros = signal<RegistroAuditoria[]>([]);
  total = signal(0);
  carregando = signal(true);
  erro = signal('');

  private recarregar$ = new Subject<number>(); // valor = atraso em ms (digitação do CPF espera)

  constructor() {
    this.recarregar$
      .pipe(
        startWith(0),
        switchMap((atraso) => timer(atraso)),
        tap(() => {
          this.carregando.set(true);
          this.erro.set('');
        }),
        switchMap(() =>
          this.auditoriaService
            .listar({
              acao: this.acao() ? [this.acao()!] : undefined,
              cpf: soDigitos(this.cpfFiltro) || undefined,
              inicio: this.inicio || undefined,
              fim: this.fim || undefined,
              page: this.paginaAtual() - 1,
              size: POR_PAGINA,
            })
            .pipe(
              catchError((err) => {
                this.erro.set(mensagemDeErro(err, 'Não foi possível carregar a auditoria.'));
                return of<Pagina<RegistroAuditoria>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 0 });
              })
            )
        ),
        takeUntilDestroyed()
      )
      .subscribe((p) => {
        this.registros.set(p.content);
        this.total.set(p.totalElements);
        this.carregando.set(false);
      });
  }

  escolherCategoria(acao: AcaoAuditoria | null) {
    this.acao.set(acao);
    this.recarregarDoInicio();
  }

  aoDigitarCpf() {
    this.paginaAtual.set(1);
    this.recarregar$.next(400);
  }

  aoMudarPeriodo() {
    if (this.inicio && this.fim && this.fim < this.inicio) {
      this.erroPeriodo.set('A data final deve ser igual ou posterior à inicial.');
      return;
    }
    this.erroPeriodo.set('');
    this.recarregarDoInicio();
  }

  limparFiltros() {
    this.cpfFiltro = '';
    this.inicio = '';
    this.fim = '';
    this.erroPeriodo.set('');
    this.acao.set(null);
    this.recarregarDoInicio();
  }

  atualizar() {
    this.recarregar$.next(0);
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.recarregar$.next(0);
  }

  private recarregarDoInicio() {
    this.paginaAtual.set(1);
    this.recarregar$.next(0);
  }
}
