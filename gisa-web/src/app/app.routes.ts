import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RecuperarSenha } from './features/auth/recuperar-senha/recuperar-senha';
import { RedefinirSenha } from './features/auth/redefinir-senha/redefinir-senha';
import { authGuard, semSessaoGuard } from './core/auth/auth-guard';
import { ROTA_INICIO } from './core/auth/permissoes';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [semSessaoGuard] },
  { path: 'esqueci-senha', component: RecuperarSenha, canActivate: [semSessaoGuard] },
  // Sem guard: o link do e-mail (e o primeiro acesso) vale mesmo com outra sessão aberta no navegador.
  { path: 'redefinir-senha', component: RedefinirSenha },
  // Telas do sistema (sem painéis por perfil): cada uma exige a sua permissão. Sem sessão, o
  // authGuard leva ao login.
  {
    path: '',
    canActivate: [authGuard],
    loadChildren: () => import('./features/telas.routes').then((m) => m.telasRoutes),
  },
  { path: '**', redirectTo: ROTA_INICIO },
];
