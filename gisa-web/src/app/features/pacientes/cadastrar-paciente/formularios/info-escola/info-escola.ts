import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ComErros } from '../../../../../shared/components/com-erros';
import { TipoEscola } from '../../../../../core/models/escola.model';
import { Escola } from '../../../../../core/models/escola.model';
import { EscolaService } from '../../../../../core/services/escola';
import { formatarCelular } from '../../../../../shared/utils/formatacao.util';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
  selector: 'app-info-escola',
  styleUrl: './info-escola.scss',
  templateUrl: './info-escola.html',
})
export class InfoEscola extends ComErros {
  private escolaService = inject(EscolaService);
  private busca$ = new Subject<string>();

  nome = '';
  tipoEscola: TipoEscola | '' = '';
  telefone = '';

  // Escola já cadastrada escolhida na lista. Se null e houver nome, a escola é nova
  // e será cadastrada (POST /escolas) antes do paciente.
  escolaSelecionada: Escola | null = null;
  sugestoes = signal<Escola[]>([]);

  // Edição: o paciente já tem escola cadastrada.
  @Input() set escolaInicial(e: Escola | null | undefined) {
    if (!e) return;
    this.nome = e.nome;
    this.tipoEscola = e.tipoEscola;
    this.telefone = formatarCelular(e.telefone ?? '');
    this.escolaSelecionada = e;
  }

  opcoesTipoEscola: { label: string; value: TipoEscola }[] = [
    { label: 'Pública', value: 'PUBLICA' },
    { label: 'Particular', value: 'PARTICULAR' },
  ];

  constructor() {
    super();
    this.busca$
      .pipe(
        debounceTime(300),
        map((t) => t.trim()),
        distinctUntilChanged(),
        switchMap((t) =>
          t.length < 2
            ? of([] as Escola[])
            : this.escolaService.buscarPorNome(t).pipe(catchError(() => of([] as Escola[])))
        ),
        takeUntilDestroyed()
      )
      .subscribe((lista) => this.sugestoes.set(lista));
  }

  get escolaNova(): boolean {
    return !this.escolaSelecionada && this.nome.trim().length > 0;
  }

  aoDigitarNome() {
    this.limparErro('nome');
    this.limparErro('escola');
    this.busca$.next(this.nome);
    this.sincronizarSelecao();
  }

  // Nome igual a uma sugestão = escola existente (preenche tipo e telefone).
  private sincronizarSelecao() {
    const alvo = this.nome.trim().toLowerCase();
    const achada = this.sugestoes().find((s) => s.nome.trim().toLowerCase() === alvo) ?? null;

    if (achada) {
      this.escolaSelecionada = achada;
      this.tipoEscola = achada.tipoEscola;
      this.telefone = achada.telefone ?? '';
    } else if (this.escolaSelecionada && this.escolaSelecionada.nome.trim().toLowerCase() !== alvo) {
      this.escolaSelecionada = null;
      this.tipoEscola = '';
      this.telefone = '';
    }
  }

  limpar() {
    this.nome = '';
    this.tipoEscola = '';
    this.telefone = '';
    this.escolaSelecionada = null;
    this.sugestoes.set([]);
    this.erros = {};
  }
}
