import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lerContextoPacientes } from '../contexto-pacientes';
import { ICONES } from '../../../shared/icons';
import { PacienteResumo } from '../../../core/models/paciente.model';
import { FiltroPacientes, PacienteService } from '../../../core/services/paciente';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { CardPacienteComponent } from './card-paciente/card-paciente';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { soDigitos } from '../../../shared/utils/texto.util';

@Component({
  selector: 'app-gerenciar-pacientes',
  imports: [CardPacienteComponent, CabecalhoPagina, CardEstatistica, BuscaFiltro, Paginacao],
  templateUrl: './gerenciar-pacientes.html',
  styleUrl: './gerenciar-pacientes.scss',
})
export class GerenciarPacientes implements OnInit {
  private pacienteService = inject(PacienteService);
  private auth = inject(Auth);
  private contexto = lerContextoPacientes(inject(ActivatedRoute));

  rotaBase = this.contexto.rotaBase;
  podeCadastrar = !this.contexto.somenteLeitura && this.auth.temPermissao('CADASTRAR_PACIENTE');
  podeEditar = !this.contexto.somenteLeitura && this.auth.temPermissao('EDITAR_PACIENTE');

  icones = ICONES;

  carregando = signal(false);
  erro = signal('');
  termoBusca = signal('');
  pacientes = signal<PacienteResumo[]>([]);
  totalElementos = signal(0);
  paginaAtual = signal(1);
  itensPorPagina = 9; // padrão da API: 3 cards por linha x 3 linhas

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.pacienteService.listar(this.filtro()).subscribe({
      next: (pagina) => {
        this.carregando.set(false);
        this.pacientes.set(pagina.content);
        this.totalElementos.set(pagina.totalElements);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível carregar os pacientes.'));
      },
    });
  }

  // Termo só com números (e máscara) busca por CPF; o resto busca por nome.
  private filtro(): FiltroPacientes {
    const termo = this.termoBusca().trim();
    const ehCpf = !!termo && /^[\d.\-\s]+$/.test(termo);
    return {
      page: this.paginaAtual() - 1, // API é 0-indexed
      size: this.itensPorPagina,
      cpf: ehCpf ? soDigitos(termo) : undefined,
      nome: ehCpf ? undefined : termo || undefined,
    };
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
