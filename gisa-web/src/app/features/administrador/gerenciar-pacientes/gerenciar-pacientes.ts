import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lerContextoPacientes } from '../../../core/routing/contexto-pacientes';
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
  private contexto = lerContextoPacientes(inject(ActivatedRoute));

  // Perfil de leitura (ex.: Assistente Social): sem "Novo Paciente" e sem "Editar".
  somenteLeitura = this.contexto.somenteLeitura;
  rotaBase = this.contexto.rotaBase;

  icones = ICONES;

  // Estado em signals: os componentes do projeto não são re-verificados sozinhos
  // quando uma resposta HTTP chega, então o template precisa ler signals.
  carregando = signal(false);
  erro = signal('');
  termoBusca = signal('');
  pacientes = signal<PacienteLista[]>([]);
  totalElementos = signal(0);
  paginaAtual = signal(1);
  itensPorPagina = 6; // 3 cards por linha x 2 linhas

  emBusca = computed(() => !!this.termoBusca().trim());

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    const buscando = this.emBusca();
    const pagina = buscando ? 0 : this.paginaAtual() - 1; // API é 0-indexed
    const tamanho = buscando ? TAMANHO_BUSCA : this.itensPorPagina;

    this.pacienteService.listarPaginado(pagina, tamanho).subscribe({
      next: (res) => {
        this.carregando.set(false);
        if (buscando) {
          const filtrados = res.content.filter((p) => this.bateComBusca(p));
          this.pacientes.set(filtrados);
          this.totalElementos.set(filtrados.length);
        } else {
          this.pacientes.set(res.content);
          this.totalElementos.set(res.totalElements);
        }
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(err?.error?.message || 'Não foi possível carregar os pacientes.');
      },
    });
  }

  // Ignora maiúsculas/acentos no nome; CPF casa com ou sem máscara.
  private bateComBusca(p: PacienteLista): boolean {
    const normalizar = (t: string) =>
      t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const termo = this.termoBusca().trim();
    const digitos = soDigitos(termo);
    return (
      normalizar(p.nome).includes(normalizar(termo)) ||
      (digitos.length > 0 && p.cpf.includes(digitos))
    );
  }

  mudarPagina(pagina: number): void {
    this.paginaAtual.set(pagina);
    this.carregar();
  }

  aplicarBusca(estado: EstadoBusca): void {
    this.termoBusca.set(estado.termo);
    this.paginaAtual.set(1);
    this.carregar();
  }
}
