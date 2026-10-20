import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { TipoFiltro, filtrarTexto } from '../utils/filtro-texto.util';

// Descarta caracteres não permitidos no campo: <input appFiltro="nome" [(ngModel)]="nome">
// Funciona ao digitar, colar e arrastar. Quando algo é removido, dispara um novo 'input'
// para o ngModel (e os (input) da tela) receberem o valor já limpo.
@Directive({ selector: 'input[appFiltro]' })
export class Filtro {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  appFiltro = input.required<TipoFiltro>();

  @HostListener('input', ['$event'])
  aoDigitar(evento: InputEvent) {
    // Durante a composição (acento com tecla morta) o texto ainda não é final; limpa no compositionend.
    if (!evento.isComposing) this.limpar();
  }

  @HostListener('compositionend')
  aoComporTexto() {
    this.limpar();
  }

  private limpar() {
    const bruto = this.el.value;
    const limpo = filtrarTexto(this.appFiltro(), bruto);
    if (limpo === bruto) return;

    const cursor = this.el.selectionStart ?? bruto.length;
    const posicao = filtrarTexto(this.appFiltro(), bruto.slice(0, cursor)).length;
    this.el.value = limpo;
    this.el.setSelectionRange(posicao, posicao);
    this.el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
