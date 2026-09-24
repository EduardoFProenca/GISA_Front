import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type Perfil = 'ADMINISTRADOR' | 'MEDICO' | 'RECEPCIONISTA' | 'ASSISTENTE_SOCIAL';

@Component({
  selector: 'app-info-usuario',
  imports: [FormsModule],
  templateUrl: './info-usuario.html',
  styleUrl: './info-usuario.scss',
})
export class InfoUsuario implements OnInit {
  @Input() dadosIniciais?: Partial<InfoUsuario>;
  @Input() somenteLeitura: boolean = false;

  temAcessoSistema: boolean = false;
  senha: string = '';
  perfil: Perfil | '' = '';
  idCopiado: boolean = false;

  perfis: { valor: Perfil; label: string }[] = [
    { valor: 'ADMINISTRADOR', label: 'Administrador' },
    { valor: 'MEDICO', label: 'Médico' },
    { valor: 'RECEPCIONISTA', label: 'Recepcionista' },
    { valor: 'ASSISTENTE_SOCIAL', label: 'Assistente Social' },
  ];

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
  }
}