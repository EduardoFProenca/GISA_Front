import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UsuarioLogado } from '../models/auth.model';
import { Auth, decodificarToken } from './auth';

function criarToken(payload: object): string {
  const b64 = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.assinatura`;
}

function usuario(perfil: string, permissoes: string[] = []): UsuarioLogado {
  return {
    idCadastro: 9,
    nome: 'Mariana Costa',
    cpf: '12345678902',
    tipoCadastro: 'PROFISSIONAL',
    perfil: { idPerfil: 3, nome: perfil },
    permissoes: permissoes.map((nome, i) => ({ idPermissao: i + 1, nome, descricao: '' })),
  };
}

describe('Auth', () => {
  let auth: Auth;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'login', children: [] }])],
    });
    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  });

  function entrar(u: UsuarioLogado) {
    auth.login({ cpf: '123', senha: '12345678' }).subscribe();
    http.expectOne(`${environment.apiUrl}/auth/login`).flush({ token: criarToken({ sub: '123' }) });
    http.expectOne(`${environment.apiUrl}/usuarios/me`).flush(u);
  }

  it('decodifica o payload do token', () => {
    expect(decodificarToken(criarToken({ sub: '123' }))?.['sub']).toBe('123');
    expect(decodificarToken('lixo')).toBe(null);
  });

  it('no login guarda o token e carrega o usuário de /usuarios/me', () => {
    entrar(usuario('Recepção'));

    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.usuarioAtual()?.nome).toBe('Mariana Costa');
    expect(auth.rotaInicial()).toBe('/recepcao');
  });

  it('ACESSO_TOTAL libera qualquer funcionalidade', () => {
    entrar(usuario('Administrador', ['ACESSO_TOTAL']));

    expect(auth.temPermissao('VISUALIZAR_AUDITORIA')).toBe(true);
    expect(auth.temPermissao('GERENCIAR_USUARIOS')).toBe(true);
  });

  it('libera só as funcionalidades cujas permissões o perfil tem', () => {
    entrar(usuario('Recepção', ['EDITAR_PACIENTE', 'REGISTRAR_PRESENCA']));

    expect(auth.temPermissao('EDITAR_PACIENTE')).toBe(true);
    expect(auth.temPermissao('REGISTRAR_PRESENCA')).toBe(true);
    expect(auth.temPermissao('CADASTRAR_PACIENTE')).toBe(false);
    expect(auth.temPermissao('VISUALIZAR_AUDITORIA')).toBe(false);
  });

  it('perfil "Especialista" em cadastro que não é de especialista não abre o painel do especialista', () => {
    entrar(usuario('Especialista'));

    expect(auth.rotaInicial()).toBe(null);
  });

  it('perfil "Especialista" em cadastro de especialista abre o painel do especialista', () => {
    entrar({ ...usuario('Especialista'), tipoCadastro: 'ESPECIALISTA' });

    expect(auth.rotaInicial()).toBe('/especialista');
  });

  it('perfil sem painel mapeado não tem rota inicial', () => {
    entrar(usuario('Financeiro'));

    expect(auth.rotaInicial()).toBe(null);
  });

  it('logout limpa token e usuário', () => {
    entrar(usuario('Recepção'));

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
