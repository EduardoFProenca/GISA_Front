import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CabecalhoPagina } from '../../../shared/components/cabecalho-pagina/cabecalho-pagina';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { FormDialog } from '../../../shared/components/form-dialog/form-dialog';
import { StatusTerapia, Terapia } from '../../../core/models/terapia.model';
import { TerapiaService } from '../../../core/services/terapia';
import { Auth } from '../../../core/auth/auth';
import { mensagemDeErro } from '../../../core/http/erro-api';
import { dataExtenso, hojeIso } from '../../../shared/utils/data.util';
import { ROTULO_MODALIDADE, ROTULO_STATUS_TERAPIA } from '../../../shared/utils/rotulos.util';
import { lerContextoTerapias } from '../contexto-terapias';
import { CardTerapiaPresenca, PresencaMarcada } from '../registrar-presenca/componentes/card-terapia-presenca/card-terapia-presenca';
import { horarioTerapia } from '../registrar-presenca/presenca.util';

// Próximo status pelo botão principal (transições da API; cancelar é à parte).
const PROXIMO: Partial<Record<StatusTerapia, { status: StatusTerapia; texto: string; mensagem: string }>> = {
  AGENDADA: {
    status: 'EM_ATENDIMENTO',
    texto: 'Iniciar atendimento',
    mensagem: 'A terapia passa a "Em atendimento".',
  },
  EM_ATENDIMENTO: {
    status: 'CONCLUIDA',
    texto: 'Concluir terapia',
    mensagem: 'A terapia passa a "Concluída" e não poderá mais mudar de status.',
  },
};

@Component({
  selector: 'app-detalhe-terapia',
  imports: [FormsModule, RouterLink, CabecalhoPagina, ConfirmDialog, FormDialog, CardTerapiaPresenca],
  templateUrl: './detalhe-terapia.html',
  styleUrl: './detalhe-terapia.scss',
})
export class DetalheTerapia implements OnInit {
  private route = inject(ActivatedRoute);
  private terapiaService = inject(TerapiaService);
  private auth = inject(Auth);

  rotaBase = lerContextoTerapias(this.route).rotaBase;
  id = Number(this.route.snapshot.paramMap.get('id'));

  podeEditar = this.auth.temPermissao('EDITAR_TERAPIA');
  podeAlterarStatus = this.auth.temPermissao('ALTERAR_STATUS_TERAPIA');
  podeRegistrarPresenca = this.auth.temPermissao('REGISTRAR_PRESENCA');

  carregando = signal(true);
  erro = signal('');
  terapia = signal<Terapia | null>(null);

  rotuloStatus = computed(() => {
    const t = this.terapia();
    return t ? ROTULO_STATUS_TERAPIA[t.status] : '';
  });
  rotuloModalidade = computed(() => {
    const t = this.terapia();
    return t ? ROTULO_MODALIDADE[t.modalidade] : '';
  });
  quando = computed(() => {
    const t = this.terapia();
    return t ? `${dataExtenso(t.data)}, ${horarioTerapia(t)}` : '';
  });
  // A API aceita iniciar em qualquer data, mas o atendimento só deve começar no dia da terapia.
  foraDoDia = computed(() => {
    const t = this.terapia();
    return !!t && t.status === 'AGENDADA' && t.data !== hojeIso();
  });
  proximo = computed(() => {
    const t = this.terapia();
    if (!t || this.foraDoDia()) return null;
    return PROXIMO[t.status] ?? null;
  });
  podeCancelar = computed(() => {
    const s = this.terapia()?.status;
    return s === 'AGENDADA' || s === 'EM_ATENDIMENTO';
  });

  // Ações
  confirmacaoAberta = signal(false);
  cancelamentoAberto = signal(false);
  motivo = '';
  salvando = signal(false);
  erroAcao = signal('');
  erroCancelamento = signal('');
  salvandoPresenca = signal<number | null>(null);

  ngOnInit() {
    this.carregar();
  }

  private carregar() {
    this.carregando.set(true);
    this.terapiaService.buscar(this.id).subscribe({
      next: (t) => {
        this.terapia.set(t);
        this.carregando.set(false);
      },
      error: (err) => {
        this.erro.set(err?.status === 404 ? 'Terapia não encontrada.' : mensagemDeErro(err, 'Não foi possível carregar a terapia.'));
        this.carregando.set(false);
      },
    });
  }

  avancarStatus() {
    const proximo = this.proximo();
    this.confirmacaoAberta.set(false);
    if (!proximo) return;
    this.alterarStatus(proximo.status);
  }

  abrirCancelamento() {
    this.motivo = '';
    this.erroCancelamento.set('');
    this.cancelamentoAberto.set(true);
  }

  confirmarCancelamento() {
    if (!this.motivo.trim()) {
      this.erroCancelamento.set('Informe o motivo do cancelamento.');
      return;
    }
    this.alterarStatus('CANCELADA', this.motivo.trim());
  }

  private alterarStatus(status: StatusTerapia, motivo?: string) {
    this.salvando.set(true);
    this.erroAcao.set('');
    this.terapiaService.alterarStatus(this.id, { status, motivo }).subscribe({
      next: (t) => {
        this.terapia.set(t);
        this.salvando.set(false);
        this.cancelamentoAberto.set(false);
      },
      error: (err) => {
        this.salvando.set(false);
        const msg = mensagemDeErro(err, 'Não foi possível alterar o status.');
        if (this.cancelamentoAberto()) this.erroCancelamento.set(msg);
        else this.erroAcao.set(msg);
      },
    });
  }

  registrarPresenca(marcada: PresencaMarcada) {
    this.erroAcao.set('');
    this.salvandoPresenca.set(marcada.idPaciente);
    this.terapiaService
      .registrarPresenca(this.id, marcada.idPaciente, { presenca: marcada.presenca, justificativa: marcada.justificativa })
      .subscribe({
        next: (t) => {
          this.terapia.set(t);
          this.salvandoPresenca.set(null);
        },
        error: (err) => {
          this.salvandoPresenca.set(null);
          this.erroAcao.set(mensagemDeErro(err, 'Não foi possível registrar a presença.'));
        },
      });
  }
}
