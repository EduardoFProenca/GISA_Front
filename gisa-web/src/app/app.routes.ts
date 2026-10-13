import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { painelGuard, semSessaoGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [semSessaoGuard] },
  {
    path: 'administrador',
    canActivate: [painelGuard('ADMINISTRADOR')],
    loadChildren: () => import('./features/administrador/administrador.routes').then(m => m.administradorRoutes)
  },
  {
    path: 'recepcao',
    canActivate: [painelGuard('RECEPCAO')],
    loadChildren: () => import('./features/recepcao/recepcao.routes').then(m => m.recepcaoRoutes)
  },
  {
    path: 'assistente-social',
    canActivate: [painelGuard('ASSISTENTE_SOCIAL')],
    loadChildren: () => import('./features/assistente-social/assistente-social.routes').then(m => m.assistenteSocialRoutes)
  },
  {
    path: 'especialista',
    canActivate: [painelGuard('ESPECIALISTA')],
    loadChildren: () => import('./features/especialista/especialista.routes').then(m => m.especialistaRoutes)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
