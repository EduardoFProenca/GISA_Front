import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AlterarMinhaSenhaPayload,
  FiltroUsuarios,
  TokenResponse,
  UsuarioDetalhe,
  UsuarioResumo,
} from '../models/auth.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';
import { Auth } from '../auth/auth';
import { montarParams } from './params.util';
import { comCarregamento } from '../http/carregamento';

// Senhas e usuários de acesso (ver USUARIOS.md). Toda troca de senha encerra as sessões abertas daquele usuário.
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private base = `${environment.apiUrl}/usuarios`;

  // Devolve um token novo, que substitui o atual (o antigo deixa de valer).
  // Senha atual errada responde 400 (não 401), então não desloga.
  alterarMinhaSenha(dados: AlterarMinhaSenhaPayload): Observable<TokenResponse> {
    return this.http
      .patch<TokenResponse>(`${this.base}/minha-senha`, dados)
      .pipe(tap((res) => this.auth.substituirToken(res.token)));
  }

  // ---------- Administração de acessos (GERENCIAR_USUARIOS) ----------

  // Padrão da API: 9 por página, por nome.
  listar(filtro: FiltroUsuarios = {}): Observable<Pagina<UsuarioResumo>> {
    return this.http
      .get<PaginaApi<UsuarioResumo>>(this.base, { params: montarParams({ ...filtro }) })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  buscar(idCadastro: number): Observable<UsuarioDetalhe> {
    return this.http.get<UsuarioDetalhe>(`${this.base}/${idCadastro}`, { context: comCarregamento() });
  }

  // Vale na próxima requisição do usuário, sem novo login.
  trocarPerfil(idCadastro: number, idPerfil: number): Observable<UsuarioDetalhe> {
    return this.http.patch<UsuarioDetalhe>(`${this.base}/${idCadastro}/perfil`, { idPerfil });
  }

  // Gera uma nova senha temporária e a envia ao e-mail do usuário (também serve para reenviar o acesso).
  // A senha anterior deixa de valer. 503 = o e-mail não saiu e nada foi alterado.
  enviarSenhaTemporaria(idCadastro: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${idCadastro}/senha-temporaria`, null);
  }

  // Apaga só o usuário (o cadastro continua); os tokens dele deixam de valer na hora.
  retirarAcesso(idCadastro: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${idCadastro}`);
  }
}
