import { Component, effect, inject, signal } from '@angular/core';
import { CarregamentoService } from '../../../core/http/carregamento';

// Atraso antes de aparecer: ações rápidas (ex.: marcar presença) não fazem a tela piscar.
const ATRASO_MS = 300;

// Overlay de loading enquanto houver ação gravando dados na API ou um registro abrindo.
// Fica uma vez só, no app.html; o interceptor de carregamento decide quando está ativo.
@Component({
  imports: [],
  selector: 'app-loading-spinner',
  styleUrl: './loading-spinner.scss',
  templateUrl: './loading-spinner.html',
})
export class LoadingSpinner {
  private carregamento = inject(CarregamentoService);

  // "Processando..." ao gravar, "Carregando..." ao abrir um registro (ver CarregamentoService).
  mensagem = this.carregamento.mensagem;
  visivel = signal(false);

  constructor() {
    effect((onCleanup) => {
      if (!this.carregamento.ativo()) {
        this.visivel.set(false);
        return;
      }
      const t = setTimeout(() => this.visivel.set(true), ATRASO_MS);
      onCleanup(() => clearTimeout(t));
    });
  }
}
