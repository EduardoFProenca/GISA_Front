import { Injectable, inject } from '@angular/core';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';
import { Auth } from '../auth/auth';
import { ProfissionalService } from './profissional';

// Dados do especialista logado usados nas telas (agenda, cabeçalho do atestado).
export interface PerfilEspecialista {
  idCadastro: number;
  nome: string;
  especialidades: string[];
  registroConselho: string | null; // ex.: 'CRM-12345', 'CREFITO-678'
  cbo: string | null; // código CBO do cargo
}

@Injectable({ providedIn: 'root' })
export class EspecialistaLogadoService {
  private auth = inject(Auth);
  private profissionais = inject(ProfissionalService);
  private cache$?: Observable<PerfilEspecialista>;

  // GET /usuarios/me (já carregado no login) + GET /especialistas/me. O especialista não tem
  // VISUALIZAR_PROFISSIONAIS, então não pode usar GET /especialistas/{id}.
  perfil(): Observable<PerfilEspecialista> {
    this.cache$ ??= this.carregar().pipe(shareReplay({ bufferSize: 1, refCount: false }));
    return this.cache$;
  }

  private carregar(): Observable<PerfilEspecialista> {
    const usuario$ = this.auth.usuarioAtual() ? of(this.auth.usuarioAtual()!) : this.auth.carregarUsuario();
    return usuario$.pipe(
      switchMap((usuario) =>
        this.profissionais.meuCadastroEspecialista().pipe(
          map((esp): PerfilEspecialista => ({
            idCadastro: usuario.idCadastro,
            nome: usuario.nome,
            especialidades: esp.especialidades.map((e) => e.nome),
            registroConselho: esp.registroConselho ?? null,
            cbo: esp.profissional.cargo?.codigoCBO ?? null,
          }))
        )
      )
    );
  }
}
