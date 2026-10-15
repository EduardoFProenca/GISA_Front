import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Auth } from '../auth/auth';
import { ehRotaPublicaAuth } from '../auth/auth-interceptor';
import { lerErroApi } from './erro-api';

// Encerra a sessão quando a API recusa o token (ausente, expirado ou emitido antes da última
// troca de senha). O erro continua seguindo para a tela tratar.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && tokenRecusado(req.url, err)) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};

function tokenRecusado(url: string, err: HttpErrorResponse): boolean {
  if (!url.startsWith(environment.apiUrl)) return false;
  // No login, 401 é e-mail/senha errados (ou senha temporária vencida): quem trata é a tela.
  if (ehRotaPublicaAuth(url)) return false;
  if (err.status === 401) return true;
  // 403 COM corpo = usuário logado sem a permissão da rota (a sessão continua válida).
  // 403 sem corpo = token inválido.
  return err.status === 403 && !lerErroApi(err)?.message;
}
