import { Component, HostListener, input, output } from '@angular/core';
import { Botao } from '../botao/botao';
import { ICONES } from '../../icons';

export type LarguraDialogo = 'sm' | 'md' | 'lg';

let proximoId = 0;

// Casca de todos os modais do sistema: overlay, caixa, título à esquerda, X e Esc.
// O conteúdo (mensagem, campos, botões) vem por <ng-content>; o rodapé usa a classe global .dialogo-acoes.
// Uso: <app-dialogo [aberto]="x()" titulo="..." largura="sm" (fechar)="...">...</app-dialogo>
@Component({
  selector: 'app-dialogo',
  imports: [Botao],
  templateUrl: './dialogo.html',
  styleUrl: './dialogo.scss',
})
export class Dialogo {
  aberto = input(false);
  titulo = input('');
  largura = input<LarguraDialogo>('md');
  // false: a caixa cresce conforme o conteúdo e não rola por dentro (forms com listas que rolam sozinhas).
  rolagem = input(true);

  fechar = output<void>();

  protected readonly icones = ICONES;
  // id único por instância: a mesma tela pode ter vários modais, e aria-labelledby precisa apontar para o certo.
  protected readonly idTitulo = `dialogo-titulo-${proximoId++}`;

  // Esc já tratado por um componente de dentro (ex.: select-menu fechando a lista) não fecha o modal.
  @HostListener('document:keydown.escape', ['$event'])
  protected aoPressionarEsc(evento: Event) {
    if (this.aberto() && !evento.defaultPrevented) this.fechar.emit();
  }
}
