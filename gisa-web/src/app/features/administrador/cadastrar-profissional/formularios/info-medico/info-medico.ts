import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mascara } from '../../../../../shared/directives/mascara.directive';

@Component({
  selector: 'app-info-medico',
  standalone: true,          
  imports: [FormsModule, Mascara],
  templateUrl: './info-medico.html',
  styleUrl: './info-medico.scss',
})
export class InfoMedico {
 
  especialidade: string = '';
  registroProfissional: string = '';
  estadoRegistro: string = '';
  cargaHoraria: number = 40; 
  atuaComoPJ: boolean = false;

  cnpj: string = '';
  razaoSocial: string = '';
  nomeFantasia: string = '';
  inscricaoEstadual: string = '';

  incrementarCarga() {
    this.cargaHoraria = Math.min(this.cargaHoraria + 1, 60); // trava em 60h, evita valor absurdo
  }

  decrementarCarga() {
    this.cargaHoraria = Math.max(this.cargaHoraria - 1, 0); // não deixa negativo
  }
}
