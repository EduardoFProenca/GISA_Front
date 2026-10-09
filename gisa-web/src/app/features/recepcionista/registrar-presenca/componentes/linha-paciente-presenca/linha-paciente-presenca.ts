import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacienteConsulta, StatusPresenca } from '../../../../../core/models/consulta-diaria.model';
import { LABEL_PRESENCA } from '../../presenca.util';

@Component({
  selector: 'app-linha-paciente-presenca',
  imports: [FormsModule],
  templateUrl: './linha-paciente-presenca.html',
  styleUrl: './linha-paciente-presenca.scss',
})
export class LinhaPacientePresenca {
  paciente = input.required<PacienteConsulta>();
  bloqueado = input(false);

  marcarPresente = output<void>();
  marcarFalta = output<void>();
  marcarFaltaJustificada = output<string>();

  StatusPresenca = StatusPresenca;

  editando = signal(false);
  texto = signal('');

  rotulo = computed(() => {
    const presenca = this.paciente().presenca;
    return presenca ? LABEL_PRESENCA[presenca] : 'Pendente';
  });

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