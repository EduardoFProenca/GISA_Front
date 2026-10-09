import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'administrador',
    loadChildren: () => import('./features/administrador/administrador.routes').then(m => m.administradorRoutes)
  },
  {
    path: 'recepcionista',
    loadChildren: () => import('./features/recepcionista/recepcionista.routes').then(m => m.recepcionistaRoutes)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];