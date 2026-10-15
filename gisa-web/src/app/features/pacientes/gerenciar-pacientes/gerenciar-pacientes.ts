import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lerContextoPacientes } from '../contexto-pacientes';
import { PacienteResumo } from '../../../core/models/paciente.model';
import { PacienteService, termoBuscaPacienteValido } from '../../../core/services/paciente';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { CardPacienteComponent } from './card-paciente/card-paciente';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { BuscaFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';

// LGPD: não há listagem de pacientes. A tela começa vazia e só mostra quem foi buscado
// (nome com 3 letras ou CPF completo; a API devolve até 20, com o CPF mascarado).
@Component({
  selector: 'app-gerenciar-pacientes',
  imports: [CardPacienteComponent, CabecalhoPagina, BuscaFiltro],
  templateUrl: './gerenciar-pacientes.html',
  styleUrl: './gerenciar-pacientes.scss',
})
export class GerenciarPacientes {
  private pacienteService = inject(PacienteService);
  private auth = inject(Auth);
  private contexto = lerContextoPacientes(inject(ActivatedRoute));

  rotaBase = this.contexto.rotaBase;
  podeCadastrar = this.auth.temPermissao('CADASTRAR_PACIENTE');
  podeEditar = this.auth.temPermissao('EDITAR_PACIENTE');

  readonly limiteResultados = 20;

  carregando = signal(false);
  erro = signal('');
  // '' = ainda não buscou (ou o termo não basta para buscar).
  termoBuscado = signal('');
  termoInsuficiente = signal(false);
  pacientes = signal<PacienteResumo[]>([]);

  aplicarBusca(estado: EstadoBusca): void {
    const termo = estado.termo.trim();
    this.erro.set('');
    this.pacientes.set([]);
    this.termoInsuficiente.set(!!termo && !termoBuscaPacienteValido(termo));
    if (!termo || this.termoInsuficiente()) {
      this.termoBuscado.set('');
      return;
    }

    this.termoBuscado.set(termo);
    this.carregando.set(true);
    this.pacienteService.pesquisar({ termo }).subscribe({
      next: (lista) => {
        if (this.termoBuscado() !== termo) return; // já buscou outro termo
        this.carregando.set(false);
        this.pacientes.set(lista);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err, 'Não foi possível buscar os pacientes.'));
      },
    });
  }
}
