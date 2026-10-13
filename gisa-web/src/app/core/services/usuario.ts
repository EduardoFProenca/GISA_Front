import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AlterarMinhaSenhaPayload, LoginResponse, RedefinirSenhaPayload } from '../models/auth.model';
import { Auth } from '../auth/auth';

// Senhas (ver USUARIOS.md). Toda troca de senha encerra as sessões abertas daquele usuário.
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private base = `${environment.apiUrl}/usuarios`;

  // Devolve um token novo, que substitui o atual (o antigo deixa de valer).
  // Senha atual errada responde 400 (não 401), então não desloga.
  alterarMinhaSenha(dados: AlterarMinhaSenhaPayload): Observable<LoginResponse> {
    return this.http
      .patch<LoginResponse>(`${this.base}/minha-senha`, dados)
      .pipe(tap((res) => this.auth.substituirToken(res.token)));
  }

  // Administrador (ACESSO_TOTAL ou CADASTRAR_USUARIO); 204.
  redefinirSenha(idCadastro: number, dados: RedefinirSenhaPayload): Observable<void> {
    return this.http.patch<void>(`${this.base}/${idCadastro}/senha`, dados);
  }
}
