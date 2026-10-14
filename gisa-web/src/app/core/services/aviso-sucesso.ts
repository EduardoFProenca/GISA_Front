import { Injectable, signal } from '@angular/core';

export interface AcaoAviso {
  texto: string;
  // Botão em destaque (normalmente o próximo passo mais provável).
  primaria?: boolean;
  // Executada ao clicar; o aviso fecha antes.
  acao: () => void;
}

export interface Aviso {
  titulo: string; // "Paciente cadastrado"
  detalhe?: string; // "Lucas Almeida Souza"
  // Sem ações: o aviso some sozinho e não bloqueia a página (ações rápidas).
  // Com ações: fica aberto até a pessoa escolher (fins de fluxo).
  acoes?: AcaoAviso[];
}

const TEMPO_AUTO_FECHAR_MS = 2200;

// Aviso de sucesso padrão do sistema, exibido por <app-aviso-sucesso> (uma vez, no app.html).
// Uso: avisoSucesso.mostrar({ titulo: 'Presença registrada', detalhe: paciente.nome })
@Injectable({ providedIn: 'root' })
export class AvisoSucessoService {
  readonly atual = signal<Aviso | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  mostrar(aviso: Aviso) {
    clearTimeout(this.temporizador);
    this.atual.set(aviso);
    if (!aviso.acoes?.length) {
      this.temporizador = setTimeout(() => this.fechar(), TEMPO_AUTO_FECHAR_MS);
    }
  }

  fechar() {
    clearTimeout(this.temporizador);
    this.atual.set(null);
  }

  executar(acao: AcaoAviso) {
    this.fechar();
    acao.acao();
  }
}
