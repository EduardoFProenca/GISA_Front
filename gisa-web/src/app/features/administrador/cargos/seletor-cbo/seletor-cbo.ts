import { Mascara } from '../../../../shared/directives/mascara.directive';
import { Component, ElementRef, HostListener, effect, inject, input, model, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, debounceTime, map, of, switchMap } from 'rxjs';
import { Cbo } from '../../../../core/models/cargo.model';
import { CargoService } from '../../../../core/services/cargo';
import { CboCatalogoService, OcupacaoCbo } from '../../../../core/services/cbo-catalogo';
import { HttpErrorResponse } from '@angular/common/http';
import { formatarCbo } from '../../../../shared/utils/formatacao.util';
import { aplicarErrosApi } from '../../../../core/http/erro-api';
import { filtroDeBuscaCbo, rotuloCbo } from '../cbo.util';
import { soDigitos } from '../../../../shared/utils/texto.util';
import { AvisoSucessoService } from '../../../../core/services/aviso-sucesso';
import { Filtro } from '../../../../shared/directives/filtro.directive';

// Autocomplete de CBO com busca no servidor (GET /cbos é paginado). Se o CBO não existir,
// permite cadastrá-lo ali mesmo (POST /cbos) e já o seleciona (fluxo do CARGOS.md).
// A tabela oficial da CBO 2002 sugere as ocupações ainda não cadastradas (um clique cadastra e usa)
// e completa o título no cadastro manual.
@Component({
  selector: 'app-seletor-cbo',
  imports: [FormsModule, Mascara, Filtro],
  templateUrl: './seletor-cbo.html',
  styleUrl: './seletor-cbo.scss',
})
export class SeletorCbo {
  private avisoSucesso = inject(AvisoSucessoService);
  private cargoService = inject(CargoService);
  private catalogoService = inject(CboCatalogoService);
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  selecionado = model<Cbo | null>(null);
  comErro = input(false);

  termo = signal('');
  aberto = signal(false);
  buscando = signal(false);
  resultados = signal<Cbo[]>([]);
  totalResultados = signal(0);

  // Tabela oficial e as sugestões dela para o termo atual (só as que não vieram da API).
  private oficial = signal<Map<string, OcupacaoCbo> | null>(null);
  oficiais = signal<OcupacaoCbo[]>([]);
  erroOficial = signal('');
  private tituloAutomatico = '';
  readonly formatarCbo = formatarCbo;

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
    this.catalogoService.catalogo().subscribe({ next: (m) => this.oficial.set(m), error: () => {} });

    this.busca$
      .pipe(
        debounceTime(300),
        switchMap((termo) => {
          this.buscando.set(true);
          return this.cargoService.listarCbos({ ...filtroDeBuscaCbo(termo), size: 8 }).pipe(
            map((p) => ({ lista: p.content, total: p.totalElements, termo })),
            catchError(() => of({ lista: [] as Cbo[], total: 0, termo }))
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe(({ lista, total, termo }) => {
        this.buscando.set(false);
        this.resultados.set(lista);
        this.totalResultados.set(total);
        const cadastrados = new Set(lista.map((c) => c.codigoCBO));
        const oficial = this.oficial();
        this.oficiais.set(
          oficial ? this.catalogoService.buscar(oficial, termo, 8).filter((o) => !cadastrados.has(o.codigoCBO)).slice(0, 5) : []
        );
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
    this.erroOficial.set('');
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

  // Ocupação oficial escolhida: usa o CBO se já estiver na API; se não, cadastra com o título oficial.
  usarOficial(o: OcupacaoCbo) {
    this.erroOficial.set('');
    this.aberto.set(false);
    this.cargoService.buscarCbo(o.codigoCBO).subscribe({
      next: (cbo) => this.escolher(cbo),
      error: (err: HttpErrorResponse) => {
        if (err.status !== 404) {
          this.erroOficial.set('Não foi possível usar este CBO. Tente novamente.');
          return;
        }
        this.cargoService.criarCbo(o).subscribe({
          next: (cbo) => {
            this.avisoSucesso.mostrar({ titulo: 'CBO cadastrado', detalhe: rotuloCbo(cbo) });
            this.escolher(cbo);
          },
          error: () => this.erroOficial.set('Não foi possível cadastrar este CBO. Tente novamente.'),
        });
      },
    });
  }

  // Código completo no cadastro manual: preenche o título oficial (sem apagar o que foi digitado).
  aoMudarNovoCodigo(valor: string) {
    this.novoCodigo.set(valor);
    const ocupacao = this.oficial()?.get(soDigitos(valor));
    const titulo = this.novoTitulo().trim();
    if (ocupacao && (!titulo || titulo === this.tituloAutomatico)) {
      this.novoTitulo.set(ocupacao.tituloCBO);
      this.tituloAutomatico = ocupacao.tituloCBO;
    }
  }

  // Pré-preenche o cadastro com o que foi digitado (dígitos viram código; texto vira título).
  abrirCadastro() {
    const termo = this.termo().trim();
    const digitos = soDigitos(termo);
    const ehCodigo = digitos.length > 0 && digitos.length === termo.replace(/[\s.-]/g, '').length;
    this.tituloAutomatico = '';
    this.novoTitulo.set(ehCodigo ? '' : termo);
    this.aoMudarNovoCodigo(ehCodigo ? digitos.slice(0, 6) : '');
    this.errosNovo.set({});
    this.erroNovo.set('');
    this.cadastrando.set(true);
    this.aberto.set(false);
  }

  cadastrarCbo() {
    const codigoCBO = soDigitos(this.novoCodigo());
    const tituloCBO = this.novoTitulo().trim();
    const erros: Record<string, string> = {};
    if (codigoCBO.length !== 6) erros['codigoCBO'] = 'Informe os 6 dígitos do código.';
    else if (this.oficial() && !this.oficial()!.has(codigoCBO)) erros['codigoCBO'] = 'Código não encontrado na CBO 2002 oficial.';
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
