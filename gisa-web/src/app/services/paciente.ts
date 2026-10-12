import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PacienteLista, PacienteResumo } from '../core/models/paciente-resumo.model';
import { PacienteDetalhe, PacienteEdicaoPayload } from '../core/models/paciente-detalhe.model';
import { CadastroPacienteResponse, PacienteCadastroPayload } from '../core/models/paciente-cadastro.model';
import { PaginaSpring } from '../core/models/profissional-resumo.model';
import { PACIENTES_EXEMPLO, paraLista } from '../core/data/pacientes-exemplo';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/pacientes`;

  // GET /api/pacientes (paginado, 0-indexed).
  listar(): Observable<PacienteResumo[]> {
    const params = new HttpParams().set('page', 0).set('size', 1000);
    return this.http
      .get<PaginaSpring<PacienteResumo>>(this.base, { params })
      .pipe(map((pagina) => pagina.content));
  }

  cadastrar(dados: PacienteCadastroPayload): Observable<CadastroPacienteResponse> {
    return this.http.post<CadastroPacienteResponse>(this.base, dados);
  }

  listarPaginado(pagina: number, tamanho: number): Observable<PaginaSpring<PacienteLista>> {
    if (environment.usarDadosExemplo) {
      const todos = PACIENTES_EXEMPLO.map(paraLista).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      const inicio = pagina * tamanho;
      return of({
        content: todos.slice(inicio, inicio + tamanho),
        totalElements: todos.length,
        totalPages: Math.max(1, Math.ceil(todos.length / tamanho)),
        number: pagina,
        size: tamanho,
      }).pipe(delay(250));
    }

    const params = new HttpParams()
      .set('page', pagina)
      .set('size', tamanho)
      .set('sort', 'nome,asc');
    return this.http.get<PaginaSpring<PacienteLista>>(this.base, { params });
  }

  // ATENÇÃO: GET /pacientes/{id} ainda não consta na documentação da API (endpoint assumido).
  buscarPorId(id: number): Observable<PacienteDetalhe> {
    if (environment.usarDadosExemplo) {
      const achado = PACIENTES_EXEMPLO.find((p) => p.idCadastro === id);
      return achado
        ? of(achado).pipe(delay(250))
        : throwError(() => ({ status: 404 }));
    }
    return this.http.get<PacienteDetalhe>(`${this.base}/${id}`);
  }

  // ATENÇÃO: PUT /pacientes/{id} ainda não consta na documentação da API (endpoint assumido).
  // Com os exemplos ligados, a edição altera o exemplo em memória (some ao recarregar a página).
  editar(id: number, dados: PacienteEdicaoPayload): Observable<void> {
    if (environment.usarDadosExemplo) {
      const p = PACIENTES_EXEMPLO.find((x) => x.idCadastro === id);
      if (!p) return throwError(() => ({ status: 404 }));

      const e = dados.enderecos[0];
      p.nome = dados.nome;
      p.estadoCivil = dados.estadoCivil;
      p.celular = dados.celular ?? null;
      p.numCNS = dados.numCNS ?? null;
      p.statusPaciente = dados.statusPaciente;
      p.endereco = {
        cep: e.cep,
        endereco: e.rua,
        numero: e.numero,
        complemento: e.complemento ?? '',
        bairro: e.bairro,
        cidade: e.cidade,
        uf: e.estado,
      };
      return of(undefined).pipe(delay(400));
    }
    return this.http.put<void>(`${this.base}/${id}`, dados);
  }
}
