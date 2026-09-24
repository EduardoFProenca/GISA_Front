import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-info-profissional',
  imports: [FormsModule],
  templateUrl: './info-profissional.html',
  styleUrl: './info-profissional.scss',
})
export class InfoProfissional implements OnInit {
  @Input() dadosIniciais?: Partial<InfoProfissional>;
  @Input() somenteLeitura: boolean = false;

  cargo: string = '';
  codigoCBO: string = '';

  cargos = [
    { valor: 'ADMINISTRADOR', label: 'Administrador' },
    { valor: 'MEDICO', label: 'Médico' },
    { valor: 'RECEPCIONISTA', label: 'Recepcionista' },
    { valor: 'ASSISTENTE_SOCIAL', label: 'Assistente Social' },
  ];

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
  }
}