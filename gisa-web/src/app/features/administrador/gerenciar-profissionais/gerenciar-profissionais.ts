import { Component, OnInit, inject, signal } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, OpcaoFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { CardProfissional, ProfissionalCard } from '../../../shared/components/card-profissional/card-profissional';
import { ICONES } from '../../../shared/icons';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { ProfissionalService } from '../../../services/profissional';
import { ProfissionalResumo } from '../../../core/models/profissional.model';

@Component({
  selector: 'app-gerenciar-profissionais',
  imports: [CardEstatistica, BuscaFiltro, CardProfissional, CabecalhoPagina, Paginacao],
  templateUrl: './gerenciar-profissionais.html',
  styleUrl: './gerenciar-profissionais.scss',
})
export class GerenciarProfissionais implements OnInit {
  private profissionalService = inject(ProfissionalService);

  icones = ICONES;
  filtros: OpcaoFiltro[] = [];
  itensPorPagina = 6;

  // Signals: o app roda sem zone.js, então só signals atualizam a tela após o HTTP.
  carregando = signal(false);
  erro = signal('');
  profissionaisPaginados = signal<ProfissionalCard[]>([]);
  totalElementos = signal(0);
  paginaAtual = signal(1);
  termoBusca = signal('');

  ngOnInit() {
    this.carregarPagina();
  }

  private carregarPagina() {
    this.carregando.set(true);
    this.erro.set('');

    // API usa paginação 0-indexed
    this.profissionalService.listarPaginado(this.paginaAtual() - 1, this.itensPorPagina).subscribe({
      next: (res) => {
        this.carregando.set(false);
        this.totalElementos.set(res.totalElements);
        this.profissionaisPaginados.set(
          res.content.map((p) => this.paraCard(p)).filter((p) => this.bateComFiltroLocal(p))
        );
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.message || 'Não foi possível carregar os profissionais.');
      },
    });
  }

  private paraCard(p: ProfissionalResumo): ProfissionalCard {
    return {
      id: String(p.idProfissional),
      nome: p.nome,
      cargo: p.nomeCargo,
      crm: p.registroConselho || '—',
      statusCadastro: p.statusCadastro,
    };
  }

  private bateComFiltroLocal(p: ProfissionalCard): boolean {
    const termo = this.termoBusca().toLowerCase();
    return (
      !termo || p.nome.toLowerCase().includes(termo) || p.crm.toLowerCase().includes(termo)
    );
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.carregarPagina();
  }

  aplicarBusca(estado: EstadoBusca) {
    this.termoBusca.set(estado.termo);
    this.paginaAtual.set(1);
    this.carregarPagina();
  }
}