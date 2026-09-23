import { Component } from '@angular/core';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { InfoEscola } from './formularios/info-escola/info-escola';

@Component({
  selector: 'app-cadastrar-paciente',
  imports: [DadosPessoais, Contato, CabecalhoPagina, InfoEscola],
  styleUrl: './cadastrar-paciente.scss',
  templateUrl: './cadastrar-paciente.html',
})
export class CadastrarPaciente {
  salvarCadastro(){
    
  }
}
