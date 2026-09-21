import { Component } from '@angular/core';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro, OpcaoFiltro, EstadoBusca } from '../../../shared/components/busca-filtro/busca-filtro';
import { CardProfissional, ProfissionalCard } from './card-profissional/card-profissional';
import { ICONES } from '../../../shared/icons';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';

@Component({
  selector: 'app-gerenciar-profissionais',
  imports: [CardEstatistica, BuscaFiltro, CardProfissional, CabecalhoPagina],
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
    { id: '1', nome: 'Dr. Roberto Almeida', especialidade: 'Clínica Geral', registro: 'CRM-SP 123456', ativo: true },
    { id: '2', nome: 'Dra. Ana Souza', especialidade: 'Pediatria', registro: 'CRM-SP 654321', ativo: true },
    { id: '3', nome: 'Carlos Mendes', especialidade: 'Fisioterapia', registro: 'CREFITO-3 98765', ativo: false },
  ];

  profissionaisFiltrados: ProfissionalCard[] = [...this.todosProfissionais];

  aplicarBusca(estado: EstadoBusca) {
    this.profissionaisFiltrados = this.todosProfissionais.filter(p => {
      const bateTexto = !estado.termo ||
        p.nome.toLowerCase().includes(estado.termo.toLowerCase()) ||
        p.registro.toLowerCase().includes(estado.termo.toLowerCase());

      const bateStatus = !estado.filtros['status'] ||
        (estado.filtros['status'] === 'ativo') === p.ativo;

      return bateTexto && bateStatus;
      // filtro de especialidade/perfil entram aqui quando o dado real vier da API
    });
  }
}