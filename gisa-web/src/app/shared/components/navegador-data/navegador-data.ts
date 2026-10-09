import { Component, computed, input, output } from '@angular/core';
import { dataExtenso, hojeIso, somarDias } from '../../utils/data.util';

@Component({
  selector: 'app-navegador-data',
  imports: [],
  templateUrl: './navegador-data.html',
  styleUrl: './navegador-data.scss',
})
export class NavegadorData {
  // yyyy-MM-dd
  data = input.required<string>();
  dataAlterada = output<string>();

  extenso = computed(() => dataExtenso(this.data()));
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