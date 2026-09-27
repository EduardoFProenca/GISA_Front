import { Component, OnInit, inject } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, OpcaoFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { CardProfissional, ProfissionalCard } from './card-profissional/card-profissional';
import { ICONES } from '../../../shared/icons';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { ProfissionalService } from '../../../services/profissional';
import { ProfissionalResumo } from '../../../core/models/profissional-resumo.model';

@Component({
  selector: 'app-gerenciar-profissionais',
  imports: [CardEstatistica, BuscaFiltro, CardProfissional, CabecalhoPagina, Paginacao],
  templateUrl: './gerenciar-profissionais.html',
  styleUrl: './gerenciar-profissionais.scss',
})
export class GerenciarProfissionais implements OnInit {
  private profissionalService = inject(ProfissionalService);

  icones = ICONES;
  carregando = false;
  erro = '';

  filtros: OpcaoFiltro[] = [];

  profissionaisPaginados: ProfissionalCard[] = [];
  termoBusca = '';

  totalElementos = 0;

  paginaAtual: number = 1;
  itensPorPagina: number = 9;

  ngOnInit() {
    this.carregarPagina();
  }

  private carregarPagina() {
    this.carregando = true;
    this.erro = '';

    // API usa paginação 0-indexed
    this.profissionalService.listarPaginado(this.paginaAtual - 1, this.itensPorPagina).subscribe({
      next: (res) => {
        this.carregando = false;
        this.totalElementos = res.totalElements;
        this.profissionaisPaginados = res.content
          .map((p) => this.paraCard(p))
          .filter((p) => this.bateComFiltroLocal(p));
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err?.error?.message || 'Não foi possível carregar os profissionais.';
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
    const bateTexto = !this.termoBusca ||
      p.nome.toLowerCase().includes(this.termoBusca.toLowerCase()) ||
      p.crm.toLowerCase().includes(this.termoBusca.toLowerCase());
    return bateTexto;
  }

  mudarPagina(pagina: number) {
    this.paginaAtual = pagina;
    this.carregarPagina();
  }

  aplicarBusca(estado: EstadoBusca) {
    this.termoBusca = estado.termo;
    this.paginaAtual = 1;
    this.carregarPagina();
  }
}