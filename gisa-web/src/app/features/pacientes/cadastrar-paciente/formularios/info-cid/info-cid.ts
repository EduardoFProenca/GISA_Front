import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';
import { Cid } from '../../../../../core/models/cid.model';
import { CidSelecionado, CidService, FORMATO_CID_10 } from '../../../../../core/services/cid';
import { OpcaoSelectBusca, SelectBusca } from '../../../../../shared/components/select-busca/select-busca';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-info-cid',
  imports: [SelectBusca, FormsModule],
  templateUrl: './info-cid.html',
  styleUrl: './info-cid.scss',
})
export class InfoCid extends ComErros {
  private cidService = inject(CidService);

  // Permite reaproveitar o componente na edição (CIDs que o paciente já tem na base).
  @Input() set cidsIniciais(valor: Cid[] | undefined) {
    if (valor) this.listaCids.set(valor.map((c) => ({ ...c, novo: false })));
  }
  // O formulário pai recebe a lista sempre que ela muda. No POST e no PATCH /pacientes:
  // novo=false -> codigosCid (só o código); novo=true -> novosCids ({codigoCID, descricao}).
  @Output() cidsChange = new EventEmitter<CidSelecionado[]>();

  // Tabela oficial do CID-10 (DATASUS), baixada uma vez pelo CidService.
  private catalogo = signal<Map<string, Cid>>(new Map());
  carregandoCatalogo = signal(true);

  // Dropdown mostra "F84.0 — Autismo infantil" (busca por código, com ou sem ponto, ou por nome);
  // depois de escolher, o campo mostra só o código.
  opcoes = signal<OpcaoSelectBusca[]>([]);

  codigoSelecionado = signal<string | null>(null);
  cidSelecionado = computed(() => {
    const codigo = this.codigoSelecionado();
    return codigo ? (this.catalogo().get(codigo) ?? null) : null;
  });
  // Campo fechado: só leitura, vem do CID escolhido.
  descricao = computed(() => this.cidSelecionado()?.descricao ?? '');

  listaCids = signal<CidSelecionado[]>([]);
  erro = signal<string | null>(null);
  verificando = signal(false);

  constructor() {
    super();
    this.cidService.catalogo().subscribe({
      next: (lista) => {
        this.catalogo.set(new Map(lista.map((c) => [c.codigoCID, c])));
        this.opcoes.set(
          lista.map((c) => ({
            id: c.codigoCID,
            label: `${c.codigoCID} — ${c.descricao}`,
            rotuloSelecionado: c.codigoCID,
            termosBusca: c.codigoCID.replace('.', ''), // "F840" também encontra F84.0
          }))
        );
        this.carregandoCatalogo.set(false);
      },
      error: () => {
        this.carregandoCatalogo.set(false);
        this.erro.set('Não foi possível carregar a tabela de CIDs. Recarregue a página e tente de novo.');
      },
    });
  }

  aoEscolherCodigo(valor: number | string | null) {
    this.codigoSelecionado.set(valor === null ? null : String(valor));
    this.erro.set(null);
  }

  adicionarCid() {
    const escolhido = this.cidSelecionado();
    if (!escolhido || this.verificando()) return;

    if (this.listaCids().some((c) => c.codigoCID === escolhido.codigoCID)) {
      this.erro.set('Este CID já foi adicionado.');
      return;
    }

    // Confere na API do GISA (a primeira chamada no Render pode demorar).
    this.verificando.set(true);
    this.erro.set(null);
    this.cidService.resolver(escolhido.codigoCID).subscribe({
      next: (resultado) => {
        this.verificando.set(false);
        if (resultado.tipo === 'invalido') {
          this.erro.set('Código CID inválido.');
          return;
        }
        this.incluir({ ...resultado.cid, novo: resultado.tipo === 'novo' });
        this.codigoSelecionado.set(null);
      },
      error: () => {
        this.verificando.set(false);
        this.erro.set('Não foi possível verificar o CID agora. Tente novamente em instantes.');
      },
    });
  }

  // ---------- CID fora da tabela oficial (ex.: códigos criados depois de 2008, como U07.1) ----------

  manualAberto = signal(false);
  codigoManual = '';
  descricaoManual = '';
  erroManual = signal<string | null>(null);

  abrirManual() {
    this.codigoManual = '';
    this.descricaoManual = '';
    this.erroManual.set(null);
    this.manualAberto.set(true);
  }

  fecharManual() {
    this.manualAberto.set(false);
    this.erroManual.set(null);
  }

  // O código digitado passa pela mesma conferência do campo normal: se já existir no GISA ou na
  // tabela oficial, vale a descrição de lá; só um código desconhecido usa a descrição digitada.
  adicionarManual() {
    if (this.verificando()) return;
    const codigo = this.cidService.padronizar(this.codigoManual);
    const descricao = this.descricaoManual.trim();
    if (!FORMATO_CID_10.test(codigo)) {
      this.erroManual.set('Código inválido. Use o formato do CID-10, como F84 ou F84.0.');
      return;
    }
    if (!descricao) {
      this.erroManual.set('Informe a descrição do CID.');
      return;
    }
    if (this.listaCids().some((c) => c.codigoCID === codigo)) {
      this.erroManual.set('Este CID já foi adicionado.');
      return;
    }

    this.verificando.set(true);
    this.erroManual.set(null);
    this.cidService.resolver(codigo).subscribe({
      next: (resultado) => {
        this.verificando.set(false);
        this.incluir(
          resultado.tipo === 'invalido'
            ? { codigoCID: codigo, descricao, novo: true }
            : { ...resultado.cid, novo: resultado.tipo === 'novo' }
        );
        this.fecharManual();
      },
      error: () => {
        this.verificando.set(false);
        this.erroManual.set('Não foi possível verificar o CID agora. Tente novamente em instantes.');
      },
    });
  }

  private incluir(cid: CidSelecionado) {
    this.listaCids.update((lista) => [...lista, cid]);
    this.cidsChange.emit(this.listaCids());
  }

  removerCid(index: number) {
    this.listaCids.update((lista) => lista.filter((_, i) => i !== index));
    this.cidsChange.emit(this.listaCids());
  }

  limpar() {
    this.listaCids.set([]);
    this.codigoSelecionado.set(null);
    this.erro.set(null);
    this.erros = {};
    this.fecharManual();
  }
}
