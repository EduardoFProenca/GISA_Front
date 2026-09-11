import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class Auth {
  usuarioAtual = signal<Usuario | null>(null);

  login(usuario: Usuario) {
    this.usuarioAtual.set(usuario);
  }

  logout() {
    this.usuarioAtual.set(null);
  }
}