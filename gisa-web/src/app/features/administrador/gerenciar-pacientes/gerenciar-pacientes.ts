import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICONES } from '../../../shared/icons';
import { Paciente } from '../../../core/models/paciente.model';
import { CardPacienteComponent } from './card-paciente/card-paciente';

// Importação dos componentes compartilhados conforme gerenciar-profissionais
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina'; // Ajuste o caminho se necessário
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica'; // Ajuste o caminho se necessário
import { BuscaFiltro } from '../../../shared/components/busca-filtro/busca-filtro'; // Ajuste o caminho se necessário

@Component({
  selector: 'app-gerenciar-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    CardPacienteComponent,
    CabecalhoPagina,
    CardEstatistica,
    BuscaFiltro
  ],
  templateUrl: './gerenciar-pacientes.html',
  styleUrl: './gerenciar-pacientes.scss'
})
export class GerenciarPacientes implements OnInit {
  icones = ICONES;
  carregando: boolean = false;
  erro: string | null = null;
  termoBusca: string = '';

  // Paciente temporário de teste
  pacientes: Paciente[] = [
    {
      idPaciente: 1,
      nome: 'Lucas Oliveira Santos',
      dataNascimento: '2015-05-10',
      cpf: '123.456.789-00',
      statusPaciente: 'MATRICULADO',
      convenio: false,
      vinculosResponsavel: [
        {
          grauParentesco: 'MAE',
          responsavel: { nome: 'Maria Santos', telefone: '(11) 98765-4321', cpf: '000.111.222-33' }
        }
      ],
      cids: [{ codigoCID: 'F84.0', descricao: 'Autismo Infantil' }]
    }
  ];

  ngOnInit(): void {}

  get totalElementos(): number {
    return this.pacientesFiltrados.length;
  }

  get pacientesFiltrados(): Paciente[] {
    if (!this.termoBusca.trim()) return this.pacientes;
    const busca = this.termoBusca.toLowerCase();
    return this.pacientes.filter(p =>
      p.nome.toLowerCase().includes(busca) || p.cpf.includes(busca)
    );
  }

  aplicarBusca(termo: string): void {
    this.termoBusca = termo;
  }
}