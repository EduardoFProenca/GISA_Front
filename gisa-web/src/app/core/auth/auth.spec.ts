import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Auth, decodificarToken } from './auth';

function criarToken(payload: object): string {
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.assinatura`;
}

describe('Auth', () => {
  let auth: Auth;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }]),
      ],
    });
    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(auth).toBeTruthy();
  });

  it('decodifica o payload do token', () => {
    expect(decodificarToken(criarToken({ sub: '123' }))?.['sub']).toBe('123');
    expect(decodificarToken('lixo')).toBe(null);
  });

  it('guarda token e usuário quando a API envia nome e cargo', () => {
    auth.login({ cpf: '123', senha: '12345678' }).subscribe();
    http
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ token: criarToken({ sub: '123' }), nome: 'Maria Souza', cargo: 'Administrador' });

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.usuarioAtual()).toEqual({ nome: 'Maria Souza', cargo: 'Administrador' });
  });

  it('não define usuário quando a API envia só o token', () => {
    auth.login({ cpf: '123', senha: '12345678' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ token: criarToken({ sub: '123' }) });

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.usuarioAtual()).toBe(null);
  });

  it('logout limpa token e usuário', () => {
    localStorage.setItem('gisa_token', criarToken({ sub: '123' }));
    auth.setUsuarioAtual({ nome: 'Maria', cargo: 'Médico' });

    auth.logout();

    expect(auth.getToken()).toBe(null);
    expect(auth.usuarioAtual()).toBe(null);
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('trata token expirado como não logado', () => {
    localStorage.setItem('gisa_token', criarToken({ sub: '123', exp: 1 }));

    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.getToken()).toBe(null);
  });
});