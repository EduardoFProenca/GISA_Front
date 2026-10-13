import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { Auth } from './auth';
import { ACESSO_TOTAL, Funcionalidade, Painel } from './permissoes';

// Exige sessão e garante que nome, perfil e permissões estejam carregados (GET /usuarios/me).
function comUsuario(verificar: (auth: Auth) => boolean | UrlTree): Observable<boolean | UrlTree> | boolean | UrlTree {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return router.createUrlTree(['/login']);
  if (auth.usuarioAtual()) return verificar(auth);

  return auth.carregarUsuario().pipe(
    map(() => verificar(auth)),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
}

function irParaInicio(auth: Auth, router: Router): UrlTree {
  return router.createUrlTree([auth.rotaInicial() ?? '/login']);
}

export const authGuard: CanActivateFn = () => comUsuario(() => true);

// Cada painel só abre para o perfil dele; ACESSO_TOTAL entra em todos.
export function painelGuard(painel: Painel): CanActivateFn {
  return () => {
    const router = inject(Router);
    return comUsuario((auth) =>
      auth.painel() === painel || auth.permissoes().includes(ACESSO_TOTAL) ? true : irParaInicio(auth, router)
    );
  };
}

// Rotas com `data: { funcionalidade: '...' }` exigem a permissão correspondente.
export const permissaoGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const funcionalidade = route.data['funcionalidade'] as Funcionalidade | undefined;
  return comUsuario((auth) =>
    !funcionalidade || auth.temPermissao(funcionalidade) ? true : irParaInicio(auth, router)
  );
};

// Tela de login: quem já está logado vai direto para o seu painel.
export const semSessaoGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const rota = auth.isLoggedIn() && auth.usuarioAtual() ? auth.rotaInicial() : null;
  return rota ? router.createUrlTree([rota]) : true;
};

// Atalho para as rotas: { path: 'x', component: X, ...exigePermissao('CADASTRAR_PACIENTE') }
export function exigePermissao(funcionalidade: Funcionalidade) {
  return { canActivate: [permissaoGuard], data: { funcionalidade } };
}
