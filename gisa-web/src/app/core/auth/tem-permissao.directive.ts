import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { Auth } from './auth';
import { Funcionalidade } from './permissoes';

// Mostra o elemento só se o usuário logado tiver a funcionalidade.
// Uso: <button *temPermissao="'CADASTRAR_PACIENTE'">Novo paciente</button>
@Directive({ selector: '[temPermissao]' })
export class TemPermissao {
  private auth = inject(Auth);
  private template = inject(TemplateRef<unknown>);
  private container = inject(ViewContainerRef);

  temPermissao = input.required<Funcionalidade>();

  private visivel = false;

  constructor() {
    effect(() => {
      const pode = this.auth.temPermissao(this.temPermissao());
      if (pode && !this.visivel) this.container.createEmbeddedView(this.template);
      if (!pode && this.visivel) this.container.clear();
      this.visivel = pode;
    });
  }
}
