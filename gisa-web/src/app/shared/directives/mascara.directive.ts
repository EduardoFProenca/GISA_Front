import { Directive, ElementRef, HostListener, forwardRef, inject, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TipoMascara, aplicarMascara, posicaoAposDigitos } from '../utils/mascara.util';

// Máscara em campos com ngModel: <input appMascara="cpf" [(ngModel)]="cpf">
// Substitui o value accessor padrão do input: o modelo recebe o texto já formatado,
// e o cursor continua depois do dígito que o usuário acabou de digitar.
@Directive({
  selector: 'input[appMascara]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Mascara), multi: true }],
})
export class Mascara implements ControlValueAccessor {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  appMascara = input.required<TipoMascara>();

  private aoMudar: (valor: string) => void = () => {};
  private aoTocar: () => void = () => {};

  writeValue(valor: string | null): void {
    this.el.value = aplicarMascara(this.appMascara(), valor);
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.el.disabled = desabilitado;
  }

  @HostListener('input')
  aoDigitar() {
    const bruto = this.el.value;
    const cursor = this.el.selectionStart ?? bruto.length;
    const digitosAntesDoCursor = bruto.slice(0, cursor).replace(/\D/g, '').length;

    const formatado = aplicarMascara(this.appMascara(), bruto);
    if (formatado !== bruto) {
      this.el.value = formatado;
      const posicao = posicaoAposDigitos(formatado, digitosAntesDoCursor);
      this.el.setSelectionRange(posicao, posicao);
    }
    this.aoMudar(formatado);
  }

  @HostListener('blur')
  aoSair() {
    this.aoTocar();
  }
}
