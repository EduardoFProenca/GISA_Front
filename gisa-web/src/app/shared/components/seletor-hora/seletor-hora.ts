import { Component, input, linkedSignal, output } from '@angular/core';
import { OpcaoSelectBusca, SelectBusca } from '../select-busca/select-busca';

const doisDigitos = (n: number) => String(n).padStart(2, '0');
const opcoes = (qtd: number): OpcaoSelectBusca[] =>
  Array.from({ length: qtd }, (_, i) => ({ id: doisDigitos(i), label: doisDigitos(i) }));

const HORAS = opcoes(24);
const MINUTOS = opcoes(60); // qualquer minuto: terapias podem atrasar ou se estender

// Horário 'HH:mm' em dois selects (hora e minuto), no lugar do <input type="time"> do navegador.
// Digitar filtra a lista (ex.: "3" na hora mostra 03, 13 e 23).
// Uso: <app-seletor-hora [value]="hora()" (valueChange)="hora.set($event)" [comErro]="..." />
// Emite '' enquanto só uma das partes estiver escolhida.
@Component({
  selector: 'app-seletor-hora',
  imports: [SelectBusca],
  templateUrl: './seletor-hora.html',
  styleUrl: './seletor-hora.scss',
})
export class SeletorHora {
  value = input('');
  comErro = input(false);
  disabled = input(false);
  valueChange = output<string>();

  readonly horas = HORAS;
  readonly minutos = MINUTOS;

  // true quando o último valor emitido foi '' (só uma das partes escolhida).
  private emitiuVazio = false;

  // Acompanham o valor de fora. Quando ele volta a '' porque uma parte foi apagada aqui, mantém a
  // outra parte; quando quem limpou foi o formulário (ex.: "Agendar outra"), limpa as duas.
  hora = linkedSignal<string, string | null>({
    source: this.value,
    computation: (v, anterior) => (v ? v.slice(0, 2) : this.emitiuVazio ? (anterior?.value ?? null) : null),
  });
  minuto = linkedSignal<string, string | null>({
    source: this.value,
    computation: (v, anterior) => (v ? v.slice(3, 5) : this.emitiuVazio ? (anterior?.value ?? null) : null),
  });

  escolherHora(h: number | string | null) {
    this.hora.set(h === null ? null : String(h));
    this.emitir();
  }

  escolherMinuto(m: number | string | null) {
    this.minuto.set(m === null ? null : String(m));
    this.emitir();
  }

  private emitir() {
    const h = this.hora();
    const m = this.minuto();
    const valor = h && m ? `${h}:${m}` : '';
    this.emitiuVazio = !valor;
    this.valueChange.emit(valor);
  }
}
