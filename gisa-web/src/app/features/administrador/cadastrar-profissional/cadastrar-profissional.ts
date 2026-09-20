import { Component } from '@angular/core';
import { DadosPessoais } from '../../../shared/components/dados-pessoais/dados-pessoais';
import { Contato } from '../../../shared/components/contato/contato';
import { InfoEspecialista } from './formularios/info-especialista/info-especialista';
import { InfoUsuario } from './formularios/info-usuario/info-usuario';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';

@Component({
  selector: 'app-cadastrar-profissional',
  imports: [DadosPessoais, Contato, InfoEspecialista, InfoUsuario, CabecalhoPagina],
  templateUrl: './cadastrar-profissional.html',
  styleUrl: './cadastrar-profissional.scss',
})
export class CadastroProfissional {
  salvarCadastro() {
   
  }
}