// cadastro-profissional.ts
import { Component, signal } from '@angular/core';
import { SelecaoTipo, TipoProfissional } from './selecao-tipo/selecao-tipo';
import { DadosPessoais } from './formularios/dados-pessoais/dados-pessoais';
import { Contato } from './formularios/contato/contato';
import { InfoMedico } from './formularios/info-medico/info-medico';
import { InfoAssistenteSocial } from './formularios/info-assistente-social/info-assistente-social';

@Component({
  selector: 'app-cadastro-profissional',
  imports: [SelecaoTipo, DadosPessoais, Contato, InfoMedico, InfoAssistenteSocial],
  templateUrl: './cadastrar-profissional.html',
   styleUrl: './cadastrar-profissional.scss',
})
export class CadastroProfissional {
  tipo = signal<TipoProfissional | null>(null);
}