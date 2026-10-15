import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'gisa_token';

// Rotas públicas (login, "esqueci minha senha" e redefinição): não levam token, e um 401/400
// nelas é resposta do formulário, não sessão expirada.
export function ehRotaPublicaAuth(url: string): boolean {
  return /\/auth\/(login|esqueci-senha|redefinir-senha)$/.test(url);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Só a API do GISA recebe o token (APIs externas, como a pública de CID, não).
  // As rotas públicas nunca levam token: um token velho no localStorage faria a API
  // recusar o próprio login, mesmo com e-mail e senha corretos.
  if (!req.url.startsWith(environment.apiUrl) || ehRotaPublicaAuth(req.url)) {
    return next(req);
  }

  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
