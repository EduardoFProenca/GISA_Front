import { Component } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, OpcaoFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { CardProfissional, ProfissionalCard } from './card-profissional/card-profissional';
import { ICONES } from '../../../shared/icons';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';

@Component({
  selector: 'app-gerenciar-profissionais',
  imports: [CardEstatistica, BuscaFiltro, CardProfissional, CabecalhoPagina, Paginacao],
  templateUrl: './gerenciar-profissionais.html',
  styleUrl: './gerenciar-profissionais.scss',
})
export class GerenciarProfissionais {
  icones = ICONES;

  filtros: OpcaoFiltro[] = [
    {
      chave: 'especialidade',
      label: 'Especialidade',
      opcoes: [
        { valor: 'clinica-geral', label: 'Clínica Geral' },
        { valor: 'pediatria', label: 'Pediatria' },
        { valor: 'fisioterapia', label: 'Fisioterapia' },
      ]
    },
    {
      chave: 'perfil',
      label: 'Perfil',
      opcoes: [
        { valor: 'MEDICO', label: 'Médico' },
        { valor: 'ASSISTENTE_SOCIAL', label: 'Assistente Social' },
      ]
    },
    {
      chave: 'status',
      label: 'Status',
      opcoes: [
        { valor: 'ativo', label: 'Ativo' },
        { valor: 'inativo', label: 'Inativo' },
      ]
    },
  ];

  todosProfissionais: ProfissionalCard[] = [
    { id: '1', nome: 'Dr. Roberto Almeida', cargo: 'Médico', crm: 'CRM-SP 123456', statusCadastro: 'Ativo' },
    { id: '2', nome: 'Dra. Ana Souza', cargo: 'Médico', crm: 'CRM-SP 654321', statusCadastro: 'Ativo' },
    { id: '3', nome: 'Carlos Mendes', cargo: 'Assistente Social', crm: 'CREFITO-3 98765', statusCadastro: 'Inativo' },
     { id: '1', nome: 'Dr. Roberto Almeida', cargo: 'Médico', crm: 'CRM-SP 123456', statusCadastro: 'Ativo' },
    { id: '2', nome: 'Dra. Ana Souza', cargo: 'Médico', crm: 'CRM-SP 654321', statusCadastro: 'Ativo' },
    { id: '3', nome: 'Carlos Mendes', cargo: 'Assistente Social', crm: 'CREFITO-3 98765', statusCadastro: 'Inativo' },
     { id: '1', nome: 'Dr. Roberto Almeida', cargo: 'Médico', crm: 'CRM-SP 123456', statusCadastro: 'Ativo' },
    { id: '2', nome: 'Dra. Ana Souza', cargo: 'Médico', crm: 'CRM-SP 654321', statusCadastro: 'Ativo' },
    { id: '3', nome: 'Carlos Mendes', cargo: 'Assistente Social', crm: 'CREFITO-3 98765', statusCadastro: 'Inativo' },
      { id: '3', nome: 'Carlos Mendes', cargo: 'Assistente Social', crm: 'CREFITO-3 98765', statusCadastro: 'Inativo' },
  ];

  profissionaisFiltrados: ProfissionalCard[] = [...this.todosProfissionais];

  paginaAtual: number = 1;
  itensPorPagina: number = 9;

  get profissionaisPaginados(): ProfissionalCard[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.profissionaisFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  mudarPagina(pagina: number) {
    this.paginaAtual = pagina;
  }

 aplicarBusca(estado: EstadoBusca) {
  this.profissionaisFiltrados = this.todosProfissionais.filter(p => {
    const bateTexto = !estado.termo ||
      p.nome.toLowerCase().includes(estado.termo.toLowerCase()) ||
      p.crm.toLowerCase().includes(estado.termo.toLowerCase());

    const bateStatus = !estado.filtros['status'] ||
      estado.filtros['status'].toLowerCase() === p.statusCadastro.toLowerCase();

    return bateTexto && bateStatus;
  });
  this.paginaAtual = 1;
}


}