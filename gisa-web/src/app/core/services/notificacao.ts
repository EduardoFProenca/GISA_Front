import { Injectable, computed, signal } from '@angular/core';

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem?: string;
  criadaEm: Date;
  lida: boolean;
}

// "há 5 min", "há 2 h", "há 3 d"
export function tempoDecorrido(data: Date, agora: Date = new Date()): string {
  const minutos = Math.max(0, Math.floor((agora.getTime() - data.getTime()) / 60_000));
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  return `há ${Math.floor(horas / 24)} d`;
}

// TODO(Kauã): a API ainda não tem endpoint de notificações. Quando existir, carregar a lista
// aqui (ex.: GET /notificacoes) e chamar PATCH ao marcar como lida.
@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private proximoId = 1;

  itens = signal<Notificacao[]>([]);
  naoLidas = computed(() => this.itens().filter((n) => !n.lida).length);

  adicionar(titulo: string, mensagem?: string) {
    const nova: Notificacao = {
      id: this.proximoId++,
      titulo,
      mensagem,
      criadaEm: new Date(),
      lida: false,
    };
    this.itens.update((lista) => [nova, ...lista]);
  }

  marcarComoLida(id: number) {
    this.itens.update((lista) => lista.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }

  marcarTodasComoLidas() {
    this.itens.update((lista) => lista.map((n) => ({ ...n, lida: true })));
  }

  remover(id: number) {
    this.itens.update((lista) => lista.filter((n) => n.id !== id));
  }

  limpar() {
    this.itens.set([]);
  }
}