import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdicionarPermissoesPayload,
  AtualizacaoPerfilPayload,
  NovoPerfilPayload,
  Perfil,
  PerfilDetalhe,
  Permissao,
} from '../models/perfil.model';

// Perfis de acesso e permissões (ver PERFIS.md). As rotas que alteram o perfil devolvem os
// detalhes atualizados, para a tela ser redesenhada direto com a resposta.
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/perfis`;
  private basePermissoes = `${environment.apiUrl}/permissoes`;

  listar(): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(this.base);
  }

  buscar(id: number): Observable<PerfilDetalhe> {
    return this.http.get<PerfilDetalhe>(`${this.base}/${id}`);
  }

  criar(dados: NovoPerfilPayload): Observable<PerfilDetalhe> {
    return this.http.post<PerfilDetalhe>(this.base, dados);
  }

  // permissoesIds, se enviado, substitui todas as permissões do perfil.
  atualizar(id: number, dados: AtualizacaoPerfilPayload): Observable<PerfilDetalhe> {
    return this.http.patch<PerfilDetalhe>(`${this.base}/${id}`, dados);
  }

  // Só perfis sem usuários.
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Permissões que o perfil já tem são ignoradas.
  adicionarPermissoes(id: number, dados: AdicionarPermissoesPayload): Observable<PerfilDetalhe> {
    return this.http.post<PerfilDetalhe>(`${this.base}/${id}/permissoes`, dados);
  }

  // Diferente dos outros DELETE, devolve o perfil atualizado.
  removerPermissao(id: number, idPermissao: number): Observable<PerfilDetalhe> {
    return this.http.delete<PerfilDetalhe>(`${this.base}/${id}/permissoes/${idPermissao}`);
  }

  listarPermissoes(): Observable<Permissao[]> {
    return this.http.get<Permissao[]>(this.basePermissoes);
  }
}
