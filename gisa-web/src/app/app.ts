import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./features/auth/login/login";
import { Menu } from "./shared/components/menu/menu";
import { Dashboard } from "./features/administrador/dashboard/dashboard";
import { PainelAcoesComponent } from './shared/components/painel-acoes/painel-acoes';
import { GerenciarMedico } from './features/administrador/gerenciar-medico/gerenciar-medico';
import { DashboardMedico } from './features/medico/dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, Menu, Dashboard, PainelAcoesComponent, GerenciarMedico, DashboardMedico],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gisa-web');
}
