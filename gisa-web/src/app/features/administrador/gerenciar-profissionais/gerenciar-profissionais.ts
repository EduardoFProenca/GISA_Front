import { Component, OnInit, inject, signal } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, OpcaoFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { CardProfissional, ProfissionalCard } from '../../../shared/components/card-profissional/card-profissional';
import { ICONES } from '../../../shared/icons';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { ProfissionalService } from '../../../core/services/profissional';
import { FiltroProfissionais, ProfissionalResumo, TipoProfissional } from '../../../core/models/profissional.model';
import { StatusCadastro } from '../../../core/models/comum.model';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { soDigitos } from '../../../shared/utils/texto.util';

const ROTULO_TIPO: Record<TipoProfissional, string> = {
  PROFISSIONAL: 'Profissional',
  ESPECIALISTA: 'Especialista',
  ESPECIALISTA_PJ: 'Especialista PJ',
};

@Component({
  selector: 'app-gerenciar-profissionais',
  imports: [CardEstatistica, BuscaFiltro, CardProfissional, CabecalhoPagina, Paginacao],
  templateUrl: './gerenciar-profissionais.html',
  styleUrl: './gerenciar-profissionais.scss',
})
export class GerenciarProfissionais implements OnInit {
  private profissionalService = inject(ProfissionalService);
  private auth = inject(Auth);

  icones = ICONES;
  itensPorPagina = 9; // padrão da API: 3 cards por linha x 3 linhas

  // Pode cadastrar se tiver ao menos uma das permissões de cadastro.
  podeCadastrar =
    this.auth.temPermissao('CADASTRAR_PROFISSIONAL') ||
    this.auth.temPermissao('CADASTRAR_ESPECIALISTA') ||
    this.auth.temPermissao('CADASTRAR_ESPECIALISTA_PJ');
  podeEditar = this.auth.temPermissao('EDITAR_PROFISSIONAL');

  filtros: OpcaoFiltro[] = [
    {
      chave: 'tipo',
      label: 'Todos os tipos',
      opcoes: Object.entries(ROTULO_TIPO).map(([valor, label]) => ({ valor, label })),
    },
    {
      chave: 'status',
      label: 'Todas as situações',
      opcoes: [
        { valor: 'ATIVO', label: 'Ativos' },
        { valor: 'INATIVO', label: 'Inativos' },
      ],
    },
  ];

  carregando = signal(false);
  erro = signal('');
  profissionaisPaginados = signal<ProfissionalCard[]>([]);
  totalElementos = signal(0);
  paginaAtual = signal(1);
  busca = signal<EstadoBusca>({ termo: '', filtros: {} });

  ngOnInit() {
    this.carregarPagina();
  }

  private carregarPagina() {
    this.carregando.set(true);
    this.erro.set('');

    this.profissionalService.listar(this.filtro()).subscribe({
      next: (res) => {
        this.carregando.set(false);
        this.totalElementos.set(res.totalElements);
        this.profissionaisPaginados.set(res.content.map((p) => this.paraCard(p)));
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar os profissionais.'));
      },
    });
  }

  // Termo só com números (e máscara) busca por CPF; o resto busca por nome.
  private filtro(): FiltroProfissionais {
    const { termo, filtros } = this.busca();
    const t = termo.trim();
    const ehCpf = !!t && /^[\d.\-\s]+$/.test(t);
    return {
      page: this.paginaAtual() - 1, // API é 0-indexed
      size: this.itensPorPagina,
      cpf: ehCpf ? soDigitos(t) : undefined,
      nome: ehCpf ? undefined : t || undefined,
      tipo: filtros['tipo'] ? [filtros['tipo'] as TipoProfissional] : undefined,
      statusCadastro: (filtros['status'] as StatusCadastro) || undefined,
    };
  }

  private paraCard(p: ProfissionalResumo): ProfissionalCard {
    return {
      id: String(p.idProfissional),
      nome: p.nome,
      cargo: `${p.nomeCargo} · ${ROTULO_TIPO[p.tipo] ?? ''}`,
      crm: p.registroConselho || '—',
      statusCadastro: p.statusCadastro,
    };
  }

  mudarPagina(pagina: number) {
    this.paginaAtual.set(pagina);
    this.carregarPagina();
  }

  aplicarBusca(estado: EstadoBusca) {
    this.busca.set({ termo: estado.termo, filtros: { ...estado.filtros } });
    this.paginaAtual.set(1);
    this.carregarPagina();
  }
}
