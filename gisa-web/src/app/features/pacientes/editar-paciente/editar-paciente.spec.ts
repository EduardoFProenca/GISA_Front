import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { EditarPaciente } from './editar-paciente';
import { PacienteService } from '../../../core/services/paciente';
import { ResponsavelService } from '../../../core/services/responsavel';
import { ProfissionalService } from '../../../core/services/profissional';
import { Auth } from '../../../core/auth/auth';
import { Endereco, Pessoa } from '../../../core/models/comum.model';
import { AtualizacaoPacientePayload, Paciente } from '../../../core/models/paciente.model';
import { ResponsavelItem } from '../cadastrar-paciente/models/formularios-paciente';

const END_12: Endereco = {
  idEndereco: 12, cep: '18000000', rua: 'Rua A', numero: '10', complemento: null, bairro: 'Centro', cidade: 'Sorocaba', estado: 'SP',
};
const END_15: Endereco = {
  idEndereco: 15, cep: '18010000', rua: 'Rua B', numero: '20', complemento: null, bairro: 'Jardim', cidade: 'Sorocaba', estado: 'SP',
};

function pessoa(id: number, nome: string, cpf: string, enderecos: Endereco[]): Pessoa {
  return {
    idCadastro: id, nome, cpf, dataNascimento: '1985-01-01', sexo: 'F', celular: null, numCNS: null,
    estadoCivil: 'CASADO', statusCadastro: 'ATIVO', enderecos,
  };
}

function paciente(enderecos: Endereco[], extras: Paciente['responsaveis'] = []): Paciente {
  return {
    pessoa: { ...pessoa(1, 'Paciente Teste', '52998224725', enderecos), dataNascimento: '2015-01-01', estadoCivil: 'SOLTEIRO' },
    statusPaciente: 'MATRICULADO', dataCadastro: '2024-01-01', convenio: false, escola: null, cids: [], prontuario: null,
    assistentesSociais: [],
    responsaveis: [
      {
        responsavel: pessoa(7, 'Mãe', '12345678909', enderecos), ocupacao: null, grauParentesco: 'MAE',
        resideComPaciente: true, idsEnderecoResidencia: enderecos.map((e) => e.idEndereco!),
      },
      ...extras,
    ],
  };
}

const PAI_NOVO: ResponsavelItem = {
  nome: 'Pai Novo', cpf: '111.444.777-35', dataNascimento: '1980-01-01', sexo: 'M', estadoCivil: 'CASADO', celular: '',
  ocupacao: '', grauParentesco: 'PAI', naoResideComPaciente: false, residencia: [], endereco: null,
};

const ERRO_409 = new HttpErrorResponse({
  status: 409,
  error: { status: 409, message: 'Endereço usado por outros cadastros.', fields: {}, enderecosCompartilhados: [{ idEndereco: 12, outrosCadastros: 2 }] },
});

describe('EditarPaciente: endereço compartilhado (409)', () => {
  let fixture: ComponentFixture<EditarPaciente>;
  let c: EditarPaciente;
  let atualizar: ReturnType<typeof vi.fn>;
  let adicionarResponsavel: ReturnType<typeof vi.fn>;

  async function montar(inicial: Paciente) {
    atualizar = vi.fn();
    adicionarResponsavel = vi.fn((_id: number) =>
      of(paciente(inicial.pessoa.enderecos, [{
        responsavel: pessoa(8, 'Pai Novo', '11144477735', []), ocupacao: null, grauParentesco: 'PAI',
        resideComPaciente: false, idsEnderecoResidencia: [],
      }]))
    );
    TestBed.configureTestingModule({
      imports: [EditarPaciente],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })), snapshot: { data: {} } } },
        { provide: PacienteService, useValue: { buscar: () => of(inicial), atualizar, adicionarResponsavel } },
        { provide: ResponsavelService, useValue: { atualizar: vi.fn(() => of({})), listar: vi.fn(() => of({ content: [] })) } },
      ],
    });
    fixture = TestBed.createComponent(EditarPaciente);
    c = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function lista() {
    return c.enderecosForm!;
  }

  function corrigirRua(idEndereco: number, rua: string) {
    lista().itens = lista().itens.map((i) => (i.idEndereco === idEndereco ? { ...i, endereco: rua } : i));
  }

  function dialogo(): HTMLElement | null {
    return fixture.nativeElement.querySelector('app-dialogo-endereco-compartilhado .caixa');
  }

  function botaoSalvar(): HTMLButtonElement {
    return dialogo()!.querySelector('button[data-concluir]') as HTMLButtonElement;
  }

  function enviado(chamada: number): AtualizacaoPacientePayload {
    return atualizar.mock.calls[chamada][1];
  }

  it('409 abre o diálogo com o texto do endereço e a quantidade, sem salvar', async () => {
    await montar(paciente([END_12]));
    atualizar.mockReturnValueOnce(throwError(() => ERRO_409));
    corrigirRua(12, 'Rua Nova');

    await c.salvarEdicao();
    fixture.detectChanges();

    expect(c.erroGeral()).toBe('');
    expect(dialogo()).not.toBeNull();
    expect(dialogo()!.textContent).toContain('Rua Nova, 10');
    expect(dialogo()!.textContent).toMatch(/2\s*outros cadastros/);
    expect(botaoSalvar().disabled).toBe(true);
  });

  it('"Corrigir para todos" reenvia com alterarParaTodos: true só no endereço perguntado', async () => {
    await montar(paciente([END_12, END_15]));
    atualizar.mockReturnValueOnce(throwError(() => ERRO_409)).mockReturnValueOnce(of(paciente([END_12, END_15])));
    corrigirRua(12, 'Rua Nova');
    corrigirRua(15, 'Rua B2');

    await c.salvarEdicao();
    fixture.detectChanges();
    const radios = dialogo()!.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    radios[0].click(); // Corrigir para todos
    fixture.detectChanges();
    expect(botaoSalvar().disabled).toBe(false);

    botaoSalvar().click();
    await fixture.whenStable();

    expect(atualizar).toHaveBeenCalledTimes(2);
    expect(enviado(0).enderecos!.every((e) => !('alterarParaTodos' in e) || e.alterarParaTodos === undefined)).toBe(true);
    const reenvio = enviado(1).enderecos as (Endereco & { alterarParaTodos?: boolean })[];
    expect(reenvio.find((e) => e.idEndereco === 12)!.alterarParaTodos).toBe(true);
    expect(reenvio.find((e) => e.idEndereco === 15)!.alterarParaTodos).toBeUndefined();
  });

  it('"Só para este cadastro" reenvia com alterarParaTodos: false', async () => {
    await montar(paciente([END_12]));
    atualizar.mockReturnValueOnce(throwError(() => ERRO_409)).mockReturnValueOnce(of(paciente([END_12])));
    corrigirRua(12, 'Rua Nova');

    await c.salvarEdicao();
    await c.confirmarEnderecosCompartilhados(new Map([[12, false]]));

    const reenvio = enviado(1).enderecos as (Endereco & { alterarParaTodos?: boolean })[];
    expect(reenvio[0].alterarParaTodos).toBe(false);
  });

  it('o reenvio não vincula de novo o responsável cadastrado na primeira tentativa', async () => {
    await montar(paciente([END_12]));
    atualizar.mockReturnValueOnce(throwError(() => ERRO_409)).mockReturnValueOnce(of(paciente([END_12])));
    corrigirRua(12, 'Rua Nova');
    c.infoResponsavelForm!.listaResponsaveis.push({ ...PAI_NOVO });

    await c.salvarEdicao();
    await c.confirmarEnderecosCompartilhados(new Map([[12, true]]));

    expect(adicionarResponsavel).toHaveBeenCalledTimes(1);
    expect(enviado(1).responsaveis!.map((r) => r.idResponsavel)).toEqual([7, 8]);
  });

  it('mudar o endereço com responsável residente salva direto, sem o diálogo "quem vai junto"', async () => {
    await montar(paciente([END_12]));
    atualizar.mockReturnValueOnce(of(paciente([END_12])));
    lista().itens = lista().itens.map((i) => ({ ...i, cep: '18099-000', numero: '99' }));

    await c.salvarEdicao();
    fixture.detectChanges();

    expect(atualizar).toHaveBeenCalledTimes(1);
    expect(enviado(0).responsaveis![0].indicesEnderecoResidencia).toEqual([0]);
    expect(fixture.nativeElement.textContent).not.toContain('Mudança de endereço');
    expect(dialogo()).toBeNull();
  });

  it('"Quem mora aqui": carrega cada responsável marcado no seu endereço', async () => {
    await montar({
      ...paciente([END_12, END_15]),
      responsaveis: [
        {
          responsavel: pessoa(7, 'Mãe', '12345678909', [END_12]), ocupacao: null, grauParentesco: 'MAE',
          resideComPaciente: true, idsEnderecoResidencia: [12],
        },
        {
          responsavel: pessoa(8, 'Pai', '11144477735', [END_15]), ocupacao: null, grauParentesco: 'PAI',
          resideComPaciente: true, idsEnderecoResidencia: [15],
        },
      ],
    });
    fixture.detectChanges();

    const marcados = Array.from(fixture.nativeElement.querySelectorAll('app-quem-mora-aqui') as NodeListOf<HTMLElement>).map((b) =>
      Array.from(b.querySelectorAll('label')).filter((l) => l.querySelector('input')!.checked).map((l) => l.textContent!.trim())
    );
    expect(marcados).toEqual([['Mãe'], ['Pai']]);

    atualizar.mockReturnValueOnce(of(paciente([END_12, END_15])));
    await c.salvarEdicao();
    expect(enviado(0).responsaveis!.map((r) => r.indicesEnderecoResidencia)).toEqual([[0], [1]]);
  });
});

describe('EditarPaciente: endereço próprio de quem não reside', () => {
  const PROPRIO: Endereco = {
    idEndereco: 30, cep: '77440385', rua: 'Rua Perimetral Leste Norte', numero: '45', complemento: '',
    bairro: 'Parque Residencial São José', cidade: 'Gurupi', estado: 'TO',
  };

  async function montarCom(proprio: Endereco) {
    const inicial: Paciente = {
      ...paciente([END_12]),
      responsaveis: [{
        responsavel: pessoa(7, 'Luana', '12345678909', [proprio]), ocupacao: null, grauParentesco: 'MAE',
        resideComPaciente: false, idsEnderecoResidencia: [],
      }],
    };
    const atualizarResp = vi.fn(() => of({}));
    TestBed.configureTestingModule({
      imports: [EditarPaciente],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })), snapshot: { data: {} } } },
        { provide: PacienteService, useValue: { buscar: () => of(inicial), atualizar: vi.fn(() => of(inicial)), adicionarResponsavel: vi.fn() } },
        { provide: ResponsavelService, useValue: { atualizar: atualizarResp, listar: vi.fn(() => of({ content: [] })) } },
      ],
    });
    const fixture = TestBed.createComponent(EditarPaciente);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { c: fixture.componentInstance, atualizarResp };
  }

  it('sem mudança (complemento "" vindo da API): não faz PATCH no responsável', async () => {
    const { c, atualizarResp } = await montarCom(PROPRIO);
    c.enderecosForm!.itens = c.enderecosForm!.itens.map((i) => ({ ...i, endereco: 'Rua Nova' }));

    await c.salvarEdicao();

    expect(atualizarResp).not.toHaveBeenCalled();
  });

  it('endereço próprio alterado no card: envia o PATCH, sem idEndereco', async () => {
    const { c, atualizarResp } = await montarCom({ ...PROPRIO, complemento: null });
    c.infoResponsavelForm!.listaResponsaveis[0].endereco!.numero = '46';

    await c.salvarEdicao();

    expect(atualizarResp).toHaveBeenCalledTimes(1);
    const dados = (atualizarResp.mock.calls[0] as unknown[])[1] as { enderecos: Endereco[] };
    expect(dados.enderecos[0].numero).toBe('46');
    expect(dados.enderecos[0].idEndereco).toBeUndefined();
  });
});

describe('EditarPaciente: ordem dos PATCHs do paciente e do responsável', () => {
  const JOINVILLE: Endereco = {
    idEndereco: 40, cep: '89231485', rua: 'Rua Erwin Retzlaff', numero: '12121', complemento: null,
    bairro: 'Paranaguamirim', cidade: 'Joinville', estado: 'SC',
  };
  const OUTRO: Endereco = { ...JOINVILLE, idEndereco: 41, rua: 'Rua Outra', numero: '1' };

  async function montarCom(enderecosLuana: Endereco[], atualizarResp = vi.fn(() => of({}))) {
    const inicial: Paciente = {
      ...paciente([JOINVILLE]),
      responsaveis: [{
        responsavel: pessoa(7, 'Luana', '12345678909', enderecosLuana), ocupacao: null, grauParentesco: 'MAE',
        resideComPaciente: true, idsEnderecoResidencia: [40],
      }],
    };
    const atualizarPac = vi.fn(() => of(inicial));
    TestBed.configureTestingModule({
      imports: [EditarPaciente],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })), snapshot: { data: {} } } },
        { provide: PacienteService, useValue: { buscar: () => of(inicial), atualizar: atualizarPac, adicionarResponsavel: vi.fn() } },
        { provide: ResponsavelService, useValue: { atualizar: atualizarResp, listar: vi.fn(() => of({ content: [] })) } },
      ],
    });
    const fixture = TestBed.createComponent(EditarPaciente);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { c: fixture.componentInstance, atualizarPac, atualizarResp };
  }

  // A5, item 5: o paciente muda e a Luana deixa de residir, ficando no endereço de antes.
  function luanaNaoResideEPacienteMuda(c: EditarPaciente) {
    const luana = c.infoResponsavelForm!.listaResponsaveis[0];
    luana.naoResideComPaciente = true;
    luana.residencia = [];
    luana.endereco = { cep: '89231-485', endereco: 'Rua Erwin Retzlaff', numero: '12121', complemento: '', bairro: 'Paranaguamirim', cidade: 'Joinville', uf: 'SC' };
    c.enderecosForm!.itens = c.enderecosForm!.itens.map((i) => ({ ...i, cep: '89000-000', numero: '7' }));
  }

  it('endereço próprio igual a um dos atuais (não o primeiro): não faz PATCH no responsável', async () => {
    const { c, atualizarPac, atualizarResp } = await montarCom([OUTRO, JOINVILLE]);
    luanaNaoResideEPacienteMuda(c);

    await c.salvarEdicao();

    expect(atualizarPac).toHaveBeenCalledTimes(1);
    expect(atualizarResp).not.toHaveBeenCalled();
    expect(c.erroGeral()).toBe('');
  });

  it('endereço próprio novo: o PATCH do responsável vai depois do PATCH do paciente', async () => {
    const { c, atualizarPac, atualizarResp } = await montarCom([JOINVILLE]);
    luanaNaoResideEPacienteMuda(c);
    c.infoResponsavelForm!.listaResponsaveis[0].endereco!.numero = '500';

    await c.salvarEdicao();

    expect(atualizarResp).toHaveBeenCalledTimes(1);
    expect(atualizarPac.mock.invocationCallOrder[0]).toBeLessThan(atualizarResp.mock.invocationCallOrder[0]);
  });

  it('falha no responsável depois do paciente salvo: avisa que o paciente foi salvo', async () => {
    const erro = new HttpErrorResponse({ status: 400, error: { message: 'Recusado.', fields: {} } });
    const { c } = await montarCom([JOINVILLE], vi.fn(() => throwError(() => erro)));
    luanaNaoResideEPacienteMuda(c);
    c.infoResponsavelForm!.listaResponsaveis[0].endereco!.numero = '500';

    await c.salvarEdicao();

    expect(c.erroGeral()).toBe('Paciente salvo, mas não foi possível atualizar o responsável Luana: Recusado.');
  });
});

describe('EditarPaciente: responsável que mora com outros pacientes (409)', () => {
  let fixture: ComponentFixture<EditarPaciente>;
  let c: EditarPaciente;
  let atualizar: ReturnType<typeof vi.fn>;
  let adicionarResponsavel: ReturnType<typeof vi.fn>;

  const ERRO_RESIDENCIA = new HttpErrorResponse({
    status: 409,
    error: {
      status: 409, message: 'Também reside com outros pacientes.', fields: {},
      residenciasEmOutrosPacientes: [{ idResponsavel: 31, outrosPacientes: 1 }],
    },
  });

  // Luana (31) já vinculada (CPF diferente do paciente: a validação barraria o salvamento) como "não reside", com endereço próprio em outro lugar.
  const OUTRO_LUGAR: Endereco = { ...END_15, idEndereco: 50, rua: 'Rua Longe', numero: '9' };
  function inicial(): Paciente {
    return paciente([END_12], [{
      responsavel: pessoa(31, 'Luana Gomes', '98765432100', [OUTRO_LUGAR]), ocupacao: null, grauParentesco: 'MAE',
      resideComPaciente: false, idsEnderecoResidencia: [],
    }]);
  }

  async function montar(p: Paciente) {
    atualizar = vi.fn();
    adicionarResponsavel = vi.fn();
    TestBed.configureTestingModule({
      imports: [EditarPaciente],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })), snapshot: { data: {} } } },
        { provide: PacienteService, useValue: { buscar: () => of(p), atualizar, adicionarResponsavel } },
        { provide: ResponsavelService, useValue: { atualizar: vi.fn(() => of({})), listar: vi.fn(() => of({ content: [] })) } },
      ],
    });
    fixture = TestBed.createComponent(EditarPaciente);
    c = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  const dialogo = () => (fixture.nativeElement as HTMLElement).querySelector('app-dialogo-residencia-outros-pacientes .caixa');

  // Luana passa a residir no endereço do paciente.
  function luanaPassaAResidir() {
    const luana = c.infoResponsavelForm!.listaResponsaveis.find((r) => r.idResponsavel === 31)!;
    luana.naoResideComPaciente = false;
    luana.endereco = null;
    luana.residencia = [c.enderecosForm!.itens[0].chave];
  }

  it('409 do PATCH abre o diálogo; "Continua morando com eles" reenvia com true no responsável 31', async () => {
    await montar(inicial());
    atualizar.mockReturnValueOnce(throwError(() => ERRO_RESIDENCIA)).mockReturnValueOnce(of(inicial()));
    luanaPassaAResidir();

    await c.salvarEdicao();
    fixture.detectChanges();
    expect(dialogo()).not.toBeNull();
    expect(dialogo()!.textContent).toContain('Luana Gomes');
    expect(c.erroGeral()).toBe('');

    await c.confirmarResidenciasOutros(new Map([[31, true]]));

    expect(atualizar).toHaveBeenCalledTimes(2);
    const reenvio = atualizar.mock.calls[1][1] as AtualizacaoPacientePayload;
    const item = reenvio.responsaveis!.find((r) => r.idResponsavel === 31)!;
    expect(item.continuaComOutrosPacientes).toBe(true);
    expect((atualizar.mock.calls[0][1] as AtualizacaoPacientePayload).responsaveis![0].continuaComOutrosPacientes).toBeUndefined();
  });

  it('409 do vínculo novo abre o diálogo, sem "Não foi possível salvar o responsável"', async () => {
    await montar(paciente([END_12], []));
    adicionarResponsavel.mockReturnValueOnce(throwError(() => ERRO_RESIDENCIA));
    c.infoResponsavelForm!.listaResponsaveis.push({
      ...PAI_NOVO, idResponsavel: 31, reaproveitado: true, nome: 'Luana Gomes', cpf: '987.654.321-00',
      residencia: [c.enderecosForm!.itens[0].chave],
    });

    await c.salvarEdicao();
    fixture.detectChanges();

    expect(dialogo()).not.toBeNull();
    expect(c.erroGeral()).toBe('');
    expect(c.infoResponsavelForm!.erros['responsaveis']).toBeUndefined();
    expect(atualizar).not.toHaveBeenCalled();
  });

  it('confirmar o card do responsável de novo apaga a resposta', async () => {
    await montar(inicial());
    const ir = c.infoResponsavelForm!;
    ir.listaResponsaveis[0].continuaComOutrosPacientes = false;

    ir.editarResponsavel(0);
    ir.salvarResponsavel();

    expect(ir.errosCard).toEqual({});
    expect(ir.listaResponsaveis[0].continuaComOutrosPacientes).toBeUndefined();
  });
});

describe('EditarPaciente: vínculos com assistentes sociais (gravados ao salvar)', () => {
  const AS_10 = { idCadastro: 10, nome: 'Ana Assistente' };

  async function montarAs(podeEditarProfissional: boolean) {
    const inicial: Paciente = { ...paciente([END_12]), assistentesSociais: [AS_10] };
    const atualizar = vi.fn(() => of(inicial));
    const vincularPaciente = vi.fn((_idAs: number, _idPac: number) => of({}));
    const desvincularPaciente = vi.fn((_idAs: number, _idPac: number) => of(undefined));
    TestBed.configureTestingModule({
      imports: [EditarPaciente],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })), snapshot: { data: {} } } },
        { provide: PacienteService, useValue: { buscar: () => of(inicial), atualizar, adicionarResponsavel: vi.fn() } },
        { provide: ResponsavelService, useValue: { atualizar: vi.fn(() => of({})), listar: vi.fn(() => of({ content: [] })) } },
        {
          provide: ProfissionalService,
          useValue: { vincularPaciente, desvincularPaciente, listar: vi.fn(() => of({ content: [] })) },
        },
        { provide: Auth, useValue: { temPermissao: (f: string) => f !== 'EDITAR_PROFISSIONAL' || podeEditarProfissional } },
      ],
    });
    const fixture = TestBed.createComponent(EditarPaciente);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const c = fixture.componentInstance;
    return { fixture, c, atualizar, vincularPaciente, desvincularPaciente };
  }

  // Remove a Ana (10) e adiciona a Bia (11).
  function trocar(c: EditarPaciente) {
    c.assistentesForm!.remover(10);
    c.assistentesForm!.adicionar({ id: 11, label: 'Bia Assistente', rotuloSelecionado: 'Bia Assistente' });
  }

  it('com EDITAR_PROFISSIONAL: vincula e desvincula só ao salvar, depois do PATCH do paciente', async () => {
    const { c, atualizar, vincularPaciente, desvincularPaciente } = await montarAs(true);
    trocar(c);
    expect(vincularPaciente).not.toHaveBeenCalled();
    expect(desvincularPaciente).not.toHaveBeenCalled();

    await c.salvarEdicao();

    expect(vincularPaciente).toHaveBeenCalledTimes(1);
    expect(vincularPaciente).toHaveBeenCalledWith(11, 1);
    expect(desvincularPaciente).toHaveBeenCalledTimes(1);
    expect(desvincularPaciente).toHaveBeenCalledWith(10, 1);
    expect(atualizar.mock.invocationCallOrder[0]).toBeLessThan(vincularPaciente.mock.invocationCallOrder[0]);
    expect(vincularPaciente.mock.invocationCallOrder[0]).toBeLessThan(desvincularPaciente.mock.invocationCallOrder[0]);
    expect(c.erroGeral()).toBe('');
  });

  it('PATCH com 409: nenhuma chamada de vínculo', async () => {
    const { c, atualizar, vincularPaciente, desvincularPaciente } = await montarAs(true);
    atualizar.mockReturnValueOnce(throwError(() => ERRO_409));
    trocar(c);

    await c.salvarEdicao();

    expect(vincularPaciente).not.toHaveBeenCalled();
    expect(desvincularPaciente).not.toHaveBeenCalled();
  });

  it('sem EDITAR_PROFISSIONAL: lista sem ações e nenhuma chamada de vínculo', async () => {
    const { fixture, c, vincularPaciente, desvincularPaciente } = await montarAs(false);
    const secao = fixture.nativeElement.querySelector('app-assistentes-sociais-edicao') as HTMLElement;
    expect(secao.textContent).toContain('Ana Assistente');
    expect(secao.querySelector('button')).toBeNull();
    expect(secao.querySelector('app-select-busca')).toBeNull();

    await c.salvarEdicao();

    expect(vincularPaciente).not.toHaveBeenCalled();
    expect(desvincularPaciente).not.toHaveBeenCalled();
  });

  it('falha ao vincular: avisa que o paciente foi salvo e, ao salvar de novo, reenvia só o que falhou', async () => {
    const { c, vincularPaciente, desvincularPaciente } = await montarAs(true);
    const erro = new HttpErrorResponse({ status: 400, error: { message: 'Recusado.', fields: {} } });
    vincularPaciente.mockReturnValueOnce(throwError(() => erro));
    trocar(c);

    await c.salvarEdicao();

    expect(c.erroGeral()).toContain('não foi possível atualizar o vínculo com');
    expect(c.erroGeral()).toContain('Bia Assistente (vincular): Recusado.');
    expect(desvincularPaciente).toHaveBeenCalledTimes(1);

    await c.salvarEdicao();

    expect(vincularPaciente).toHaveBeenCalledTimes(2);
    expect(vincularPaciente).toHaveBeenLastCalledWith(11, 1);
    expect(desvincularPaciente).toHaveBeenCalledTimes(1);
    expect(c.erroGeral()).toBe('');
  });
});
