import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AcessoConcedidoResponse,
  AtualizacaoEspecialistaPJPayload,
  CadastroResponse,
  DadosBaseProfissional,
  DadosEspecialista,
  DadosEspecialistaPJ,
  DadosUsuario,
  Especialista,
  EspecialistaComUsuario,
  EspecialistaPJ,
  EspecialistaPJComUsuario,
  FiltroProfissionais,
  Profissional,
  ProfissionalComUsuario,
  ProfissionalDetalhe,
  ProfissionalResumo,
  TipoProfissional,
} from '../models/profissional.model';
import { Pagina, PaginaApi, normalizarPagina } from '../models/comum.model';
import { montarParams } from './params.util';

// Rota de cada tipo de cadastro (as rotas de especialista recusam PJ e vice-versa).
const ROTA_POR_TIPO: Record<TipoProfissional, string> = {
  PROFISSIONAL: 'profissionais',
  ESPECIALISTA: 'especialistas',
  ESPECIALISTA_PJ: 'especialistas/pj',
};

export function tipoDoDetalhe(d: ProfissionalDetalhe): TipoProfissional {
  return d.pj ? 'ESPECIALISTA_PJ' : d.especialista ? 'ESPECIALISTA' : 'PROFISSIONAL';
}

// Profissionais, especialistas e PJ (ver PROFISSIONAIS.md e ESPECIALISTAS.md).
@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private url(tipo: TipoProfissional, id?: number, sufixo = ''): string {
    return `${this.base}/${ROTA_POR_TIPO[tipo]}${id !== undefined ? '/' + id : ''}${sufixo}`;
  }

  listar(filtro: FiltroProfissionais = {}): Observable<Pagina<ProfissionalResumo>> {
    const params = montarParams({ sort: 'nome,asc', ...filtro });
    return this.http
      .get<PaginaApi<ProfissionalResumo>>(`${this.base}/profissionais`, { params })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  // Especialistas e PJ ativos (para escolher quem atende uma terapia).
  listarEspecialistas(): Observable<ProfissionalResumo[]> {
    return this.listar({ tipo: ['ESPECIALISTA', 'ESPECIALISTA_PJ'], statusCadastro: 'ATIVO', size: 1000 }).pipe(
      map((p) => p.content)
    );
  }

  // Começa por /especialistas/{id}: 200 = especialista (já traz o profissional);
  // 400 = é PJ -> /especialistas/pj/{id}; 404 = profissional comum -> /profissionais/{id}.
  buscarDetalhe(id: number): Observable<ProfissionalDetalhe> {
    return this.http.get<Especialista>(this.url('ESPECIALISTA', id)).pipe(
      map((especialista): ProfissionalDetalhe => ({ profissional: especialista.profissional, especialista, pj: null })),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400) {
          return this.http.get<EspecialistaPJ>(this.url('ESPECIALISTA_PJ', id)).pipe(
            map((pj): ProfissionalDetalhe => ({ profissional: pj.especialista.profissional, especialista: pj.especialista, pj }))
          );
        }
        if (err.status === 404) {
          return this.http.get<Profissional>(this.url('PROFISSIONAL', id)).pipe(
            map((profissional): ProfissionalDetalhe => ({ profissional, especialista: null, pj: null }))
          );
        }
        return throwError(() => err);
      })
    );
  }

  // ---------- Cadastro ----------

  cadastrarProfissional(dados: DadosBaseProfissional): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(this.url('PROFISSIONAL'), dados);
  }

  cadastrarProfissionalComUsuario(dados: ProfissionalComUsuario): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(this.url('PROFISSIONAL', undefined, '/com-usuario'), dados);
  }

  cadastrarEspecialista(dados: DadosEspecialista): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(this.url('ESPECIALISTA'), dados);
  }

  cadastrarEspecialistaComUsuario(dados: EspecialistaComUsuario): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(this.url('ESPECIALISTA', undefined, '/com-usuario'), dados);
  }

  cadastrarEspecialistaPJ(dados: DadosEspecialistaPJ): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(this.url('ESPECIALISTA_PJ'), dados);
  }

  cadastrarEspecialistaPJComUsuario(dados: EspecialistaPJComUsuario): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(this.url('ESPECIALISTA_PJ', undefined, '/com-usuario'), dados);
  }

  // ---------- Manutenção ----------

  // PATCH na rota do tipo, só com os campos que o tipo aceita.
  atualizar(id: number, tipo: TipoProfissional, dados: AtualizacaoEspecialistaPJPayload): Observable<unknown> {
    const { especialidadesIds, novasEspecialidades, jornadas, razaoSocial, nomeFantasia, inscricaoEstadual, ...base } = dados;
    const especialista = { ...base, especialidadesIds, novasEspecialidades, jornadas };
    const corpo =
      tipo === 'PROFISSIONAL' ? base
      : tipo === 'ESPECIALISTA' ? especialista
      : { ...especialista, razaoSocial, nomeFantasia, inscricaoEstadual };
    return this.http.patch(this.url(tipo, id), corpo);
  }

  inativar(id: number, tipo: TipoProfissional): Observable<void> {
    return this.http.delete<void>(this.url(tipo, id));
  }

  reativar(id: number, tipo: TipoProfissional): Observable<unknown> {
    return this.http.patch(this.url(tipo, id), { statusCadastro: 'ATIVO' });
  }

  // Cria o usuário de acesso de um cadastro que ainda não tem.
  concederAcesso(id: number, tipo: TipoProfissional, usuario: DadosUsuario): Observable<AcessoConcedidoResponse> {
    return this.http.post<AcessoConcedidoResponse>(this.url(tipo, id, '/usuario'), usuario);
  }
}
