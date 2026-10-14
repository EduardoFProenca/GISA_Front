import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinner } from './shared/components/loading-spinner/loading-spinner';
import { AvisoSucesso } from './shared/components/aviso-sucesso/aviso-sucesso';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingSpinner, AvisoSucesso],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('gisa-web');
}