import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlvoRemarcacao, SolicitacaoRemarcacao } from '../../../core/models/remarcacao.model';
import { AgendaEspecialistaService } from '../../../core/services/agenda-especialista';
import { mensagemDeErroRecurso } from '../../../core/services/endpoint-pendente';
import { NotificacaoService } from '../../../core/services/notificacao';
import { dataCurta, hojeIso, paraIsoMinuto } from '../../utils/data.util';
import { vazio } from '../../utils/texto.util';
import { ComErros } from '../com-erros';

// Modal reutilizável de "Solicitar Remarcação" (RF05 / CS03), usado na Agenda e no Prontuário.
// Uso: <app-modal-remarcacao [aberto]="mostrar" [alvo]="sessao" (fechar)="mostrar = false" (solicitada)="..." />
@Component({
  selector: 'app-modal-remarcacao',
  imports: [FormsModule],
  templateUrl: './modal-remarcacao.html',
  styleUrl: './modal-remarcacao.scss',
})
export class ModalRemarcacao extends ComErros {
  private agenda = inject(AgendaEspecialistaService);
  private notificacoes = inject(NotificacaoService);

  private _aberto = false;

  // Ao abrir, o formulário começa limpo.
  @Input() set aberto(valor: boolean) {
    if (valor && !this._aberto) this.reiniciar();
    this._aberto = valor;
  }
  get aberto(): boolean {
    return this._aberto;
  }

  @Input() alvo: AlvoRemarcacao | null = null;

  @Output() fechar = new EventEmitter<void>();
  @Output() solicitada = new EventEmitter<SolicitacaoRemarcacao>();

  motivo = '';
  novaData = '';
  novaHoraInicio = '';
  novaHoraTermino = '';
  hoje = hojeIso();

  // Estado que muda depois de resposta HTTP fica em signal.
  enviando = signal(false);
  erroGeral = signal('');

  get sessaoAtual(): string {
    return this.alvo ? `${dataCurta(this.alvo.data)}, ${this.alvo.horaInicio} – ${this.alvo.horaTermino}` : '';
  }

  private reiniciar() {
    this.motivo = '';
    this.novaData = '';
    // sugere o mesmo horário da sessão atual; o especialista só ajusta o que precisar
    this.novaHoraInicio = this.alvo?.horaInicio ?? '';
    this.novaHoraTermino = this.alvo?.horaTermino ?? '';
    this.erros = {};
    this.hoje = hojeIso();
    this.erroGeral.set('');
    this.enviando.set(false);
  }

  aoFechar() {
    if (!this.enviando()) this.fechar.emit();
  }

  private validar(): boolean {
    const erros: Record<string, string> = {};

    if (vazio(this.motivo)) erros['motivo'] = 'Informe a justificativa da remarcação.';
    else if (this.motivo.trim().length < 10) erros['motivo'] = 'Descreva o motivo com um pouco mais de detalhe (mín. 10 caracteres).';

    if (vazio(this.novaData)) erros['novaData'] = 'Informe a nova data sugerida.';
    if (vazio(this.novaHoraInicio)) erros['novaHoraInicio'] = 'Informe o horário de início.';
    if (vazio(this.novaHoraTermino)) erros['novaHoraTermino'] = 'Informe o horário de término.';

    if (!erros['novaHoraInicio'] && !erros['novaHoraTermino'] && this.novaHoraTermino <= this.novaHoraInicio) {
      erros['novaHoraTermino'] = 'O término precisa ser depois do início.';
    }

    if (!erros['novaData'] && !erros['novaHoraInicio']) {
      const sugerida = `${this.novaData}T${this.novaHoraInicio}`;
      if (sugerida <= paraIsoMinuto(new Date())) {
        erros['novaData'] = 'A data/horário sugerido precisa ser no futuro.';
      } else if (this.alvo && sugerida === `${this.alvo.data}T${this.alvo.horaInicio}`) {
        erros['novaData'] = 'A sugestão é igual ao horário atual da sessão.';
      }
    }

    this.erros = erros;
    return Object.keys(erros).length === 0;
  }

  enviar() {
    if (!this.alvo || this.enviando() || !this.validar()) return;

    const alvo = this.alvo;
    this.erroGeral.set('');
    this.enviando.set(true);

    this.agenda
      .solicitarRemarcacao(alvo.idTerapia, {
        motivo: this.motivo.trim(),
        novaData: this.novaData,
        novaHoraInicio: this.novaHoraInicio,
        novaHoraTermino: this.novaHoraTermino,
      })
      .subscribe({
        next: (solicitacao) => {
          this.enviando.set(false);
          this.notificacoes.adicionar(
            'Solicitação de remarcação enviada',
            `${alvo.pacienteNome}: aguardando avaliação da Secretaria/Coordenação.`
          );
          this.solicitada.emit(solicitacao);
        },
        error: (err) => {
          this.enviando.set(false);
          this.erroGeral.set(mensagemDeErroRecurso(err, 'Não foi possível enviar a solicitação. Tente novamente.'));
        },
      });
  }
}
