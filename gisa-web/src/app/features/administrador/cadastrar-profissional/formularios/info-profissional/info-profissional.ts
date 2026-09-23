import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info-profissional',
  imports: [FormsModule],
  templateUrl: './info-profissional.html',
  styleUrl: './info-profissional.scss',
})
export class InfoProfissional {
  cargo: string = '';
  codigoCBO: string = '';

  cargos = [
    { valor: 'ADMINISTRADOR', label: 'Administrador' },
    { valor: 'MEDICO', label: 'Médico' },
    { valor: 'RECEPCIONISTA', label: 'Recepcionista' },
    { valor: 'ASSISTENTE_SOCIAL', label: 'Assistente Social' },
  ];
}