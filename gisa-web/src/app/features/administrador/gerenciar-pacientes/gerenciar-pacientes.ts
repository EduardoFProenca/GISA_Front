import { Component, OnInit, inject } from '@angular/core';
import { ICONES } from '../../../shared/icons';
import { PacienteLista } from '../../../core/models/paciente-resumo.model';
import { PacienteService } from '../../../services/paciente';
import { CardPacienteComponent } from './card-paciente/card-paciente';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { soDigitos } from '../../../shared/utils/texto.util';

// A API de pacientes não tem filtro de busca (só paginação). Sem busca usamos a paginação
// do servidor; com busca carregamos um lote grande e filtramos aqui no front.
const TAMANHO_BUSCA = 500;

@Component({
  selector: 'app-gerenciar-pacientes',
  imports: [CardPacienteComponent, CabecalhoPagina, CardEstatistica, BuscaFiltro, Paginacao],
  templateUrl: './gerenciar-pacientes.html',
  styleUrl: './gerenciar-pacientes.scss',
})
export class GerenciarPacientes implements OnInit {
  private pacienteService = inject(PacienteService);

  icones = ICONES;
  carregando = false;
  erro = '';
  termoBusca = '';

  pacientes: PacienteLista[] = [];
  totalElementos = 0;

  paginaAtual = 1;
  itensPorPagina = 9;

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.carregando = true;
    this.erro = '';

    const buscando = !!this.termoBusca.trim();
    const pagina = buscando ? 0 : this.paginaAtual - 1; // API é 0-indexed
    const tamanho = buscando ? TAMANHO_BUSCA : this.itensPorPagina;

    this.pacienteService.listarPaginado(pagina, tamanho).subscribe({
      next: (res) => {
        this.carregando = false;
        if (buscando) {
          this.pacientes = res.content.filter((p) => this.bateComBusca(p));
          this.totalElementos = this.pacientes.length;
        } else {
          this.pacientes = res.content;
          this.totalElementos = res.totalElements;
        }
      },
      error: (err) => {
        this.carregando = false;
        this.erro = err?.error?.message || 'Não foi possível carregar os pacientes.';
      },
    });
  }

  // Ignora maiúsculas/acentos no nome; CPF casa com ou sem máscara.
  private bateComBusca(p: PacienteLista): boolean {
    const normalizar = (t: string) =>
      t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const termo = this.termoBusca.trim();
    const digitos = soDigitos(termo);
    return (
      normalizar(p.nome).includes(normalizar(termo)) ||
      (digitos.length > 0 && p.cpf.includes(digitos))
    );
  }

  get emBusca(): boolean {
    return !!this.termoBusca.trim();
  }

  mudarPagina(pagina: number): void {
    this.paginaAtual = pagina;
    this.carregar();
  }

  aplicarBusca(estado: EstadoBusca): void {
    this.termoBusca = estado.termo;
    this.paginaAtual = 1;
    this.carregar();
  }
}
