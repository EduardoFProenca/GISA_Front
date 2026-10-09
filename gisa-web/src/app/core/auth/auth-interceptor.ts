import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'gisa_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // O login nunca leva token: um token velho no localStorage faria a API
  // recusar o próprio login, mesmo com CPF e senha corretos.
  if (req.url.endsWith('/auth/login')) {
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