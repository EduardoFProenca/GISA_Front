import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';
import { PerfilResumo } from '../../../../../core/models/perfil.model';

export interface InfoUsuarioValor {
  // true = o cadastro já tem usuário de acesso (só o perfil pode mudar; a senha não aparece).
  possuiAcesso: boolean;
  temAcessoSistema: boolean;
  senha: string;
  // idPerfil (como texto, valor do select).
  perfil: string;
}

@Component({
  selector: 'app-info-usuario',
  imports: [FormsModule],
  templateUrl: './info-usuario.html',
  styleUrl: './info-usuario.scss',
})
export class InfoUsuario extends ComErros implements OnInit, InfoUsuarioValor {
  @Input() dadosIniciais?: Partial<InfoUsuarioValor>;
  @Input() somenteLeitura: boolean = false;
  // GET /perfis
  @Input() perfis: PerfilResumo[] = [];

  possuiAcesso: boolean = false;
  temAcessoSistema: boolean = false;
  senha: string = '';
  perfil: string = '';

  get nomePerfil(): string {
    return this.perfis.find((p) => String(p.idPerfil) === this.perfil)?.nome ?? '';
  }

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
  }
}
