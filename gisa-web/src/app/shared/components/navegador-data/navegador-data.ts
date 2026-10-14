import { Component, computed, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { ICONES } from '../../icons';
import { dataExtenso, hojeIso, somarDias } from '../../utils/data.util';

@Component({
  selector: 'app-navegador-data',
  imports: [NgIcon],
  templateUrl: './navegador-data.html',
  styleUrl: './navegador-data.scss',
})
export class NavegadorData {
  readonly icones = ICONES;
  // yyyy-MM-dd
  data = input.required<string>();
  dataAlterada = output<string>();

  // "Terça-feira, 13 de outubro de 2026": só a primeira letra maiúscula.
  extenso = computed(() => {
    const texto = dataExtenso(this.data());
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  });
  ehHoje = computed(() => this.data() === hojeIso());

  mudarDia(dias: number) {
    this.dataAlterada.emit(somarDias(this.data(), dias));
  }

  irParaHoje() {
    this.dataAlterada.emit(hojeIso());
  }

  selecionar(valor: string) {
    if (valor) this.dataAlterada.emit(valor);
  }
}