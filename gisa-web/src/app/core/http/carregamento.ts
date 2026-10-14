import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

// Loading global das ações que gravam dados (POST, PATCH, PUT, DELETE na API do GISA).
// Para uma requisição de fundo não mostrar o loading:
//   http.post(url, corpo, { context: new HttpContext().set(SEM_CARREGAMENTO, true) })
export const SEM_CARREGAMENTO = new HttpContextToken<boolean>(() => false);

const METODOS_QUE_GRAVAM = ['POST', 'PATCH', 'PUT', 'DELETE'];

@Injectable({ providedIn: 'root' })
export class CarregamentoService {
  private pendentes = signal(0);
  readonly ativo = computed(() => this.pendentes() > 0);

  iniciar() {
    this.pendentes.update((n) => n + 1);
  }

  terminar() {
    this.pendentes.update((n) => Math.max(0, n - 1));
  }
}

export const carregamentoInterceptor: HttpInterceptorFn = (req, next) => {
  const conta =
    METODOS_QUE_GRAVAM.includes(req.method) &&
    req.url.startsWith(environment.apiUrl) &&
    !req.url.endsWith('/auth/login') && // o login tem o próprio aviso de espera
    !req.context.get(SEM_CARREGAMENTO);
  if (!conta) return next(req);

  const carregamento = inject(CarregamentoService);
  carregamento.iniciar();
  return next(req).pipe(finalize(() => carregamento.terminar()));
};
