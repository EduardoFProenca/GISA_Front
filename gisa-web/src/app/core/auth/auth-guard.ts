import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { Auth } from './auth';
import { CadastroExigido, Funcionalidade, ROTA_INICIO } from './permissoes';

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

export const authGuard: CanActivateFn = () => comUsuario(() => true);

// Rotas com `data: { funcionalidades: [...] }` exigem ao menos uma das permissões; com
// `data: { cadastro: 'ESPECIALISTA' }`, também o tipo de cadastro. Sem acesso, volta ao Início.
export const permissaoGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const funcionalidades = (route.data['funcionalidades'] as Funcionalidade[] | undefined) ?? [];
  const cadastro = route.data['cadastro'] as CadastroExigido | undefined;
  return comUsuario((auth) => {
    const pode = !funcionalidades.length || funcionalidades.some((f) => auth.temPermissao(f));
    return pode && (!cadastro || auth.temCadastro(cadastro)) ? true : router.createUrlTree([ROTA_INICIO]);
  });
};

// Tela de login: quem já está logado vai direto para o Início.
export const semSessaoGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.isLoggedIn() && auth.usuarioAtual() ? router.createUrlTree([ROTA_INICIO]) : true;
};

// Atalho para as rotas: { path: 'x', component: X, ...exigePermissao('CADASTRAR_PACIENTE') }
// Com várias, basta ter uma.
export function exigePermissao(...funcionalidades: Funcionalidade[]) {
  return { canActivate: [permissaoGuard], data: { funcionalidades } };
}

// Telas que dependem do tipo de cadastro (ex.: agenda do especialista), com permissões opcionais.
export function exigeCadastro(cadastro: CadastroExigido, ...funcionalidades: Funcionalidade[]) {
  return { canActivate: [permissaoGuard], data: { cadastro, funcionalidades } };
}
