import { Component, HostListener, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { AvisoSucessoService } from '../../../core/services/aviso-sucesso';
import { ICONES } from '../../icons';

// Renderiza o aviso de sucesso atual (ver AvisoSucessoService). Fica uma vez só, no app.html.
@Component({
  selector: 'app-aviso-sucesso',
  imports: [NgIcon],
  templateUrl: './aviso-sucesso.html',
  styleUrl: './aviso-sucesso.scss',
})
export class AvisoSucesso {
  readonly servico = inject(AvisoSucessoService);
  readonly icones = ICONES;
  readonly aviso = this.servico.atual;
  // Com botões o aviso é um modal (escurece e bloqueia); sem botões, só aparece e some.
  readonly comAcoes = computed(() => !!this.aviso()?.acoes?.length);

  @HostListener('document:keydown.escape')
  aoPressionarEsc() {
    if (this.aviso() && !this.comAcoes()) this.servico.fechar();
  }
}
