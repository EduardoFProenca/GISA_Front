import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardEstatistica } from '../../../shared/components/card-estatistica/card-estatistica';
import { BuscaFiltro } from '../../../shared/components/busca-filtro/busca-filtro';
import { FiltroAvancado } from '../../../shared/components/filtro-avancado/filtro-avancado';
import { CardConsulta } from '../../../shared/components/card-consulta/card-consulta';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { Paginacao } from '../../../shared/components/paginacao/paginacao';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { GerenciarConsultas } from '../../terapias/gerenciar-consultas/gerenciar-consultas';

// Mesma lógica da Gestão de Consultas (herdada); a diferença é só o template,
// que não oferece a edição da consulta.
@Component({
  selector: 'app-controle-agendamentos',
  imports: [FormsModule, CardEstatistica, BuscaFiltro, FiltroAvancado, CardConsulta, CabecalhoPagina, Paginacao, ConfirmDialog],
  templateUrl: './controle-agendamentos.html',
  styleUrl: '../../terapias/gerenciar-consultas/gerenciar-consultas.scss',
})
export class ControleAgendamentos extends GerenciarConsultas {}