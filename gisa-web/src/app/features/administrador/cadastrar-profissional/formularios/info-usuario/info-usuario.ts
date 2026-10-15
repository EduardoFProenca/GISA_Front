import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComErros } from '../../../../../shared/components/com-erros';
import { PerfilResumo } from '../../../../../core/models/perfil.model';
import { Auth } from '../../../../../core/auth/auth';

export interface InfoUsuarioValor {
  // true = o cadastro já tem usuário de acesso (só o perfil pode mudar).
  possuiAcesso: boolean;
  temAcessoSistema: boolean;
  // idPerfil (como texto, valor do select).
  perfil: string;
}

// Eager: os erros (ComErros) chegam depois da resposta da API e precisam aparecer.
@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
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
  perfil: string = '';
  perfilOriginal?: string;

  // Criar acesso e trocar perfil exigem GERENCIAR_USUARIOS.
  readonly podeGerenciarAcesso = inject(Auth).temPermissao('GERENCIAR_USUARIOS');

  get nomePerfil(): string {
    return this.perfis.find((p) => String(p.idPerfil) === this.perfil)?.nome ?? '';
  }

  ngOnInit() {
    if (this.dadosIniciais) Object.assign(this, this.dadosIniciais);
    if (this.possuiAcesso) this.perfilOriginal = this.perfil;
    if (!this.podeGerenciarAcesso) this.temAcessoSistema = false;
  }
}
