import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PacienteTerapia, Presenca } from '../../../../../core/models/terapia.model';
import { ROTULO_PRESENCA } from '../../../../../shared/utils/rotulos.util';
import { motivoPresencaIndisponivel } from '../../presenca.util';

@Component({
  selector: 'app-linha-paciente-presenca',
  imports: [FormsModule],
  templateUrl: './linha-paciente-presenca.html',
  styleUrl: './linha-paciente-presenca.scss',
})
export class LinhaPacientePresenca {
  paciente = input.required<PacienteTerapia>();
  bloqueado = input(false);

  marcarPresente = output<void>();
  marcarFalta = output<void>();
  marcarFaltaJustificada = output<string>();
  // Volta para PENDENTE (desfaz uma marcação feita por engano).
  desfazer = output<void>();

  editando = signal(false);
  texto = signal('');

  rotulo = computed(() => ROTULO_PRESENCA[this.paciente().presenca]);
  // Vazia (terapia cancelada): os botões nem aparecem.
  semMarcacoes = computed(() => this.paciente().presencasPermitidas.length === 0);
  motivoIndisponivel = computed(() => motivoPresencaIndisponivel(this.paciente().presencasPermitidas));

  // A API diz quais marcações aceita agora; o front não recalcula a regra de prazo.
  permitida(presenca: Presenca): boolean {
    return this.paciente().presencasPermitidas.includes(presenca);
  }

  dica(presenca: Presenca, padrao = ''): string {
    return this.permitida(presenca) ? padrao : this.motivoIndisponivel();
  }

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
