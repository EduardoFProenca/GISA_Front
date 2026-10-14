import { Component, ElementRef, HostListener, effect, inject, input, model, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, debounceTime, map, of, switchMap } from 'rxjs';
import { Cbo } from '../../../../core/models/cargo.model';
import { CargoService } from '../../../../core/services/cargo';
import { aplicarErrosApi } from '../../../../core/http/erro-api';
import { apenasDigitos, filtroDeBuscaCbo, rotuloCbo } from '../cbo.util';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';

// Autocomplete de CBO com busca no servidor (GET /cbos é paginado). Se o CBO não existir,
// permite cadastrá-lo ali mesmo (POST /cbos) e já o seleciona (fluxo do CARGOS.md).
@Component({
  selector: 'app-seletor-cbo',
  imports: [FormsModule],
  templateUrl: './seletor-cbo.html',
  styleUrl: './seletor-cbo.scss',
})
export class SeletorCbo {
  private avisoSucesso = inject(AvisoSucessoService);
  private cargoService = inject(CargoService);
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  selecionado = model<Cbo | null>(null);
  comErro = input(false);

  termo = signal('');
  aberto = signal(false);
  buscando = signal(false);
  resultados = signal<Cbo[]>([]);
  totalResultados = signal(0);

  // Cadastro rápido de CBO
  cadastrando = signal(false);
  novoCodigo = signal('');
  novoTitulo = signal('');
  errosNovo = signal<Record<string, string>>({});
  erroNovo = signal('');
  salvandoNovo = signal(false);

  readonly rotulo = rotuloCbo;
  private busca$ = new Subject<string>();

  constructor() {
    this.busca$
      .pipe(
        debounceTime(300),
        switchMap((termo) => {
          this.buscando.set(true);
          return this.cargoService.listarCbos({ ...filtroDeBuscaCbo(termo), size: 8 }).pipe(
            map((p) => ({ lista: p.content, total: p.totalElements })),
            catchError(() => of({ lista: [] as Cbo[], total: 0 }))
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe(({ lista, total }) => {
        this.buscando.set(false);
        this.resultados.set(lista);
        this.totalResultados.set(total);
      });

    // Valor vindo de fora (ex.: edição): mostra o CBO escolhido no campo.
    // Ao desmarcar (usuário digitando) o texto digitado é mantido.
    effect(() => {
      const cbo = this.selecionado();
      if (cbo) untracked(() => this.termo.set(rotuloCbo(cbo)));
    });
  }

  aoFocar() {
    this.aberto.set(true);
    if (!this.resultados().length) this.busca$.next(this.selecionado() ? '' : this.termo());
  }

  aoDigitar(texto: string) {
    this.termo.set(texto);
    this.aberto.set(true);
    this.cadastrando.set(false);
    if (this.selecionado()) this.selecionado.set(null);
    this.busca$.next(texto);
  }

  escolher(cbo: Cbo) {
    this.selecionado.set(cbo);
    this.aberto.set(false);
    this.cadastrando.set(false);
  }

  // Pré-preenche o cadastro com o que foi digitado (dígitos viram código; texto vira título).
  abrirCadastro() {
    const termo = this.termo().trim();
    const digitos = apenasDigitos(termo);
    const ehCodigo = digitos.length > 0 && digitos.length === termo.replace(/[\s.-]/g, '').length;
    this.novoCodigo.set(ehCodigo ? digitos.slice(0, 6) : '');
    this.novoTitulo.set(ehCodigo ? '' : termo);
    this.errosNovo.set({});
    this.erroNovo.set('');
    this.cadastrando.set(true);
    this.aberto.set(false);
  }

  cadastrarCbo() {
    const codigoCBO = apenasDigitos(this.novoCodigo());
    const tituloCBO = this.novoTitulo().trim();
    const erros: Record<string, string> = {};
    if (codigoCBO.length !== 6) erros['codigoCBO'] = 'Informe os 6 dígitos do código.';
    if (!tituloCBO) erros['tituloCBO'] = 'Informe o título.';
    this.errosNovo.set(erros);
    this.erroNovo.set('');
    if (Object.keys(erros).length) return;

    this.salvandoNovo.set(true);
    this.cargoService.criarCbo({ codigoCBO, tituloCBO }).subscribe({
      next: (cbo) => {
        this.salvandoNovo.set(false);
        this.avisoSucesso.mostrar({ titulo: 'CBO cadastrado', detalhe: rotuloCbo(cbo) });
        this.resultados.set([]);
        this.escolher(cbo);
      },
      error: (err) => {
        this.salvandoNovo.set(false);
        const campos: Record<string, string> = {};
        const { mensagemGeral, algumCampoMarcado } = aplicarErrosApi(
          err,
          (chave, msg) => {
            if (chave !== 'codigoCBO' && chave !== 'tituloCBO') return false;
            campos[chave] = msg;
            return true;
          },
          { padrao: 'Não foi possível cadastrar o CBO.' }
        );
        this.errosNovo.set(campos);
        this.erroNovo.set(algumCampoMarcado ? '' : mensagemGeral);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  aoClicarFora(evento: MouseEvent) {
    if (!this.elemento.nativeElement.contains(evento.target as Node)) {
      this.aberto.set(false);
      // Texto digitado sem escolher: volta para o CBO selecionado.
      const cbo = this.selecionado();
      if (cbo) this.termo.set(rotuloCbo(cbo));
    }
  }
}
