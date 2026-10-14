import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, timeout } from 'rxjs';
import { soDigitos } from '../../shared/utils/texto.util';

export interface EnderecoCep {
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface RespostaViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

// Busca o endereço pelo CEP na API pública ViaCEP (gratuita, sem chave).
// É uma API externa: o authInterceptor não envia o token do GISA para ela.
@Injectable({ providedIn: 'root' })
export class CepService {
  private http = inject(HttpClient);

  // null = CEP não encontrado ou serviço indisponível (o usuário preenche à mão).
  buscar(cep: string): Observable<EnderecoCep | null> {
    const digitos = soDigitos(cep);
    if (digitos.length !== 8) return of(null);
    return this.http.get<RespostaViaCep>(`https://viacep.com.br/ws/${digitos}/json/`).pipe(
      timeout(8000),
      map((r) =>
        r.erro
          ? null
          : { rua: r.logradouro ?? '', bairro: r.bairro ?? '', cidade: r.localidade ?? '', uf: r.uf ?? '' }
      ),
      catchError(() => of(null))
    );
  }
}
