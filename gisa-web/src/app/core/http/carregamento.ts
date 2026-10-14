import { HttpContext, HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

// Loading global (overlay) de chamadas à API do GISA:
// - ações que gravam dados (POST, PATCH, PUT, DELETE): sempre, com "Processando...";
// - leituras que a tela inteira espera (GET de um registro por ID: detalhe, edição, prontuário):
//   quando pedirem, com "Carregando...":  http.get(url, { context: comCarregamento() })
// Listas e seções dentro de uma página mostram o próprio aviso e não usam o overlay.
// Para uma gravação de fundo não mostrar o loading:
//   http.post(url, corpo, { context: new HttpContext().set(SEM_CARREGAMENTO, true) })
export const SEM_CARREGAMENTO = new HttpContextToken<boolean>(() => false);
export const COM_CARREGAMENTO = new HttpContextToken<boolean>(() => false);

export function comCarregamento(): HttpContext {
  return new HttpContext().set(COM_CARREGAMENTO, true);
}

const METODOS_QUE_GRAVAM = ['POST', 'PATCH', 'PUT', 'DELETE'];

@Injectable({ providedIn: 'root' })
export class CarregamentoService {
  private gravando = signal(0);
  private lendo = signal(0);
  readonly ativo = computed(() => this.gravando() + this.lendo() > 0);
  readonly mensagem = computed(() => (this.gravando() > 0 ? 'Processando...' : 'Carregando...'));

  iniciar(leitura = false) {
    (leitura ? this.lendo : this.gravando).update((n) => n + 1);
  }

  terminar(leitura = false) {
    (leitura ? this.lendo : this.gravando).update((n) => Math.max(0, n - 1));
  }
}

export const carregamentoInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  const grava =
    METODOS_QUE_GRAVAM.includes(req.method) &&
    !req.url.endsWith('/auth/login') && // o login tem o próprio aviso de espera
    !req.context.get(SEM_CARREGAMENTO);
  const le = req.method === 'GET' && req.context.get(COM_CARREGAMENTO);
  if (!grava && !le) return next(req);

  const carregamento = inject(CarregamentoService);
  carregamento.iniciar(le);
  return next(req).pipe(finalize(() => carregamento.terminar(le)));
};
