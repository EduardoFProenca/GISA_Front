import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacienteTerapia } from '../../../../../core/models/terapia.model';
import { ROTULO_PRESENCA } from '../../../../../shared/utils/rotulos.util';

@Component({
  selector: 'app-linha-paciente-presenca',
  imports: [FormsModule],
  templateUrl: './linha-paciente-presenca.html',
  styleUrl: './linha-paciente-presenca.scss',
})
export class LinhaPacientePresenca {
  paciente = input.required<PacienteTerapia>();
  bloqueado = input(false);
  // Terapia de um dia futuro: só a falta justificada pode ser registrada.
  antesDoDia = input(false);

  marcarPresente = output<void>();
  marcarFalta = output<void>();
  marcarFaltaJustificada = output<string>();
  // Volta para PENDENTE (desfaz uma marcação feita por engano).
  desfazer = output<void>();

  editando = signal(false);
  texto = signal('');

  rotulo = computed(() => ROTULO_PRESENCA[this.paciente().presenca]);

  constructor() {
    // Quando a API devolve o paciente atualizado, o formulário fecha.
    // Se a chamada falhar, o paciente não muda e o texto digitado é mantido.
    effect(() => {
      this.paciente();
      untracked(() => this.fechar());
    });
  }

  abrir() {
    this.texto.set(this.paciente().justificativa ?? '');
    this.editando.set(true);
  }

  fechar() {
    this.editando.set(false);
    this.texto.set('');
  }

  confirmar() {
    const texto = this.texto().trim();
    if (!texto) return;
    this.marcarFaltaJustificada.emit(texto);
  }
}
