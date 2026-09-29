import { Component } from '@angular/core';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';


@Component({
  imports: [CabecalhoPagina],
  selector: 'app-gerenciar-pacientes',
  styleUrl: './gerenciar-pacientes.scss',
  templateUrl: './gerenciar-pacientes.html',
})
export class GerenciarPacientes {}
