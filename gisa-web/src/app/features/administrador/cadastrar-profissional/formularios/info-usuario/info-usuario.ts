import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type Perfil = 'ADMINISTRADOR' | 'MEDICO' | 'RECEPCIONISTA' | 'ASSISTENTE_SOCIAL';

export interface Permissao {
  chave: string;
  label: string;
  marcado: boolean;
}

@Component({
  selector: 'app-info-usuario',
  imports: [FormsModule],
  templateUrl: './info-usuario.html',
  styleUrl: './info-usuario.scss',
})
export class InfoUsuario {
  temAcessoSistema: boolean = false;

  //idGerado: string = this.gerarId();
  senha: string = '';
  perfil: Perfil | '' = '';
  idCopiado: boolean = false;


  perfis: { valor: Perfil; label: string }[] = [
    { valor: 'ADMINISTRADOR', label: 'Administrador' },
    { valor: 'MEDICO', label: 'Médico' },
    { valor: 'RECEPCIONISTA', label: 'Recepcionista' },
    { valor: 'ASSISTENTE_SOCIAL', label: 'Assistente Social' },
  ];

}