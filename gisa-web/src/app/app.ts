import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./features/auth/login/login";
import { Menu } from "./shared/components/menu/menu";
import { Dashboard } from "./features/administrador/dashboard/dashboard";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, Menu, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gisa-web');
}
