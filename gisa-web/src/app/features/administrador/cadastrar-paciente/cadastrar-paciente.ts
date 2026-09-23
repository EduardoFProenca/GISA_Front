import { Component } from '@angular/core';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';

import { InfoPaciente } from './formularios/info-paciente/info-paciente';
import { InfoEscola } from './formularios/info-escola/info-escola';
import { InfoResponsavel } from './formularios/info-responsavel/info-responsavel';
import { InfoProntuario } from './formularios/info-prontuario/info-prontuario';

@Component({
  selector: 'app-cadastrar-paciente',
  imports: [DadosPessoais, Contato, CabecalhoPagina, InfoPaciente, InfoEscola, InfoResponsavel, InfoProntuario],
  styleUrl: './cadastrar-paciente.scss',
  templateUrl: './cadastrar-paciente.html',
})
export class CadastrarPaciente {
  salvarCadastro(){
    
  }
}
