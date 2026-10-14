import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth-interceptor';
import { errorInterceptor } from './core/http/error-interceptor';
import { carregamentoInterceptor } from './core/http/carregamento';
import { provideIcons } from '@ng-icons/core';
import { ICONES_LUCIDE } from './shared/icons';
import { Auth } from './core/auth/auth';

// Com sessão salva, atualiza perfil e permissões em segundo plano (podem ter mudado no back).
function atualizarUsuarioLogado() {
  const auth = inject(Auth);
  if (auth.isLoggedIn()) auth.carregarUsuario().subscribe({ error: () => {} });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, carregamentoInterceptor])),
    provideAppInitializer(atualizarUsuarioLogado),
    // Ícones Lucide usados no sistema (ver shared/icons.ts).
    provideIcons(ICONES_LUCIDE),
  ]
};
