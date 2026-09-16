import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./features/auth/login/login";
import { Menu } from "./shared/components/menu/menu";
import { Dashboard } from "./features/administrador/dashboard/dashboard";
import { PainelAcoesComponent } from './shared/components/painel-acoes/painel-acoes';
import { GerenciarMedico } from './features/administrador/gerenciar-medico/gerenciar-medico';
import { DashboardMedico } from './features/medico/dashboard/dashboard';
import { DashboardRecepcionista } from './features/recepcionista/dashboard/dashboard';
import { DashboardAssistenteSocial } from './features/assistente-social/dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, Menu, Dashboard, PainelAcoesComponent, GerenciarMedico, DashboardMedico, DashboardRecepcionista, DashboardAssistenteSocial],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gisa-web');
}
