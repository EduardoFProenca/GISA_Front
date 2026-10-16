import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AcessoConcedidoResponse,
  AssistenteSocial,
  AssistenteSocialComUsuario,
  AtualizacaoEspecialistaPJPayload,
  DadosAssistenteSocial,
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
import { PacienteResumo } from '../models/paciente.model';
import { montarParams } from './params.util';
import { comCarregamento } from '../http/carregamento';

// Rota de cada tipo de cadastro (as rotas de especialista recusam PJ e vice-versa).
const ROTA_POR_TIPO: Record<TipoProfissional, string> = {
  PROFISSIONAL: 'profissionais',
  ESPECIALISTA: 'especialistas',
  ESPECIALISTA_PJ: 'especialistas/pj',
  ASSISTENTE_SOCIAL: 'assistentes-sociais',
};

export function tipoDoDetalhe(d: ProfissionalDetalhe): TipoProfissional {
  if (d.assistenteSocial) return 'ASSISTENTE_SOCIAL';
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

  // Cadastro do especialista logado (GET /especialistas/me): basta ser especialista, sem
  // VISUALIZAR_PROFISSIONAIS. Vem no formato do especialista ou, se for PJ, no formato do PJ.
  meuCadastroEspecialista(): Observable<Especialista> {
    return this.http
      .get<Especialista | EspecialistaPJ>(`${this.base}/especialistas/me`)
      .pipe(map((r) => ('especialista' in r ? r.especialista : r)));
  }

  listar(filtro: FiltroProfissionais = {}): Observable<Pagina<ProfissionalResumo>> {
    const params = montarParams({ sort: 'nome,asc', ...filtro });
    return this.http
      .get<PaginaApi<ProfissionalResumo>>(`${this.base}/profissionais`, { params })
      .pipe(map((resposta) => normalizarPagina(resposta)));
  }

  // Começa por /especialistas/{id}: 200 = especialista (já traz o profissional);
  // 400 = é PJ -> /especialistas/pj/{id}; 404 = não é especialista -> /assistentes-sociais/{id}
  // (200 = assistente social; 404 = profissional comum -> /profissionais/{id}).
  buscarDetalhe(id: number): Observable<ProfissionalDetalhe> {
    const vazio = { especialista: null, pj: null, assistenteSocial: null };
    const ctx = { context: comCarregamento() };
    return this.http.get<Especialista>(this.url('ESPECIALISTA', id), ctx).pipe(
      map((especialista): ProfissionalDetalhe => ({ ...vazio, profissional: especialista.profissional, especialista })),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400) {
          return this.http.get<EspecialistaPJ>(this.url('ESPECIALISTA_PJ', id), ctx).pipe(
            map((pj): ProfissionalDetalhe => ({ ...vazio, profissional: pj.especialista.profissional, especialista: pj.especialista, pj }))
          );
        }
        if (err.status !== 404) return throwError(() => err);
        return this.buscarAssistenteSocial(id).pipe(
          map((assistenteSocial): ProfissionalDetalhe => ({ ...vazio, profissional: assistenteSocial.profissional, assistenteSocial })),
          catchError((errAs: HttpErrorResponse) => {
            if (errAs.status !== 404) return throwError(() => errAs);
            return this.http.get<Profissional>(this.url('PROFISSIONAL', id), ctx).pipe(
              map((profissional): ProfissionalDetalhe => ({ ...vazio, profissional }))
            );
          })
        );
      })
    );
  }

  // ---------- Assistente social ----------

  buscarAssistenteSocial(id: number): Observable<AssistenteSocial> {
    return this.http.get<AssistenteSocial>(this.url('ASSISTENTE_SOCIAL', id), { context: comCarregamento() });
  }

  // Pacientes vinculados ao assistente social logado (Início dele; basta ser assistente social).
  meusPacientesAssistenteSocial(): Observable<PacienteResumo[]> {
    return this.http.get<PacienteResumo[]>(`${this.base}/assistentes-sociais/me/pacientes`);
  }

  // 409 se o vínculo já existe. Devolve o assistente social atualizado.
  vincularPaciente(idAssistenteSocial: number, idPaciente: number): Observable<AssistenteSocial> {
    return this.http.post<AssistenteSocial>(this.url('ASSISTENTE_SOCIAL', idAssistenteSocial, '/pacientes'), { idPaciente });
  }

  // Encerra o vínculo (o histórico fica no back).
  desvincularPaciente(idAssistenteSocial: number, idPaciente: number): Observable<void> {
    return this.http.delete<void>(this.url('ASSISTENTE_SOCIAL', idAssistenteSocial, `/pacientes/${idPaciente}`));
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

  cadastrarAssistenteSocial(dados: DadosAssistenteSocial): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(this.url('ASSISTENTE_SOCIAL'), dados);
  }

  cadastrarAssistenteSocialComUsuario(dados: AssistenteSocialComUsuario): Observable<CadastroResponse> {
    return this.http.post<CadastroResponse>(this.url('ASSISTENTE_SOCIAL', undefined, '/com-usuario'), dados);
  }

  // ---------- Manutenção ----------

  // PATCH na rota do tipo, só com os campos que o tipo aceita.
  atualizar(id: number, tipo: TipoProfissional, dados: AtualizacaoEspecialistaPJPayload): Observable<unknown> {
    const { especialidadesIds, novasEspecialidades, jornadas, razaoSocial, nomeFantasia, inscricaoEstadual, ...base } = dados;
    const especialista = { ...base, especialidadesIds, novasEspecialidades, jornadas };
    const corpo =
      tipo === 'PROFISSIONAL' || tipo === 'ASSISTENTE_SOCIAL' ? base
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
