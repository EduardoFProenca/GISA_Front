import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info-medico',
  imports: [FormsModule],
  templateUrl: './info-medico.html',
  styleUrl: './info-medico.scss',   
})
export class InfoMedico {
  especialidade: string = '';
  registroProfissional: string = '';
  estadoRegistro: string = '';
  cargaHoraria: string = '';
  atuaComoPJ: boolean = false;

  cnpj: string = '';
  razaoSocial: string = '';
  nomeFantasia: string = '';
  inscricaoEstadual: string = '';
}