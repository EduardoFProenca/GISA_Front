import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from "./features/auth/login/login";
import { Menu } from "./shared/components/menu/menu";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginComponent, Menu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gisa-web');
}
