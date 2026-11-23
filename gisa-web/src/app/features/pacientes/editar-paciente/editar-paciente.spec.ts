import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { EditarPaciente } from './editar-paciente';
import { PacienteService } from '../../../core/services/paciente';
import { ResponsavelService } from '../../../core/services/responsavel';
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
