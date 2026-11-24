import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PacienteService } from '../../../core/services/paciente';
import { PacienteCadastroPayload } from '../../../core/models/paciente.model';
import { ResponsavelItem } from './models/formularios-paciente';
import { CadastrarPaciente } from './cadastrar-paciente';
import { EnderecoForm, FormulariosPaciente } from './models/formularios-paciente';
import { PacienteCadastroPayloadService } from './services/paciente-payload';
import { PacienteValidadorService } from './services/paciente-validador';

const A1: EnderecoForm = { cep: '18000-000', endereco: 'Rua A', numero: '10', complemento: '', bairro: 'Centro', cidade: 'Sorocaba', uf: 'SP' };
const A2: EnderecoForm = { cep: '18010-000', endereco: 'Rua B', numero: '20', complemento: '', bairro: 'Jardim', cidade: 'Sorocaba', uf: 'SP' };

describe('CadastrarPaciente: "Quem mora aqui"', () => {
  let fixture: ComponentFixture<CadastrarPaciente>;
  let c: CadastrarPaciente;

  const el = () => fixture.nativeElement as HTMLElement;
  const formularios = () => (c as unknown as { formularios: FormulariosPaciente }).formularios;
  const residencias = () => c.infoResponsavel.listaResponsaveis.map((r) => r.residencia);

  function confirmarResponsavel(nome: string, cpf: string) {
    const ir = c.infoResponsavel;
    ir.abrirFormulario();
    Object.assign(ir.novoResponsavel, {
      nome, cpf, dataNascimento: '1980-01-01', sexo: 'F', estadoCivil: 'CASADO', grauParentesco: 'MAE',
    });
    ir.salvarResponsavel();
    fixture.detectChanges();
  }

  // Mesmo caminho do "Confirmar endereço": a lista avisa (mudou) e a tela ajusta a residência.
  function adicionarEndereco(e: EnderecoForm) {
    c.enderecos.adicionar({ ...e });
    c.enderecos.mudou.emit();
    fixture.detectChanges();
  }

  // Checkbox de um responsável no card do endereço `indice`.
  function checkbox(indice: number, nome: string): HTMLInputElement {
    const bloco = el().querySelectorAll('app-quem-mora-aqui')[indice];
    const label = Array.from(bloco.querySelectorAll('label')).find((l) => l.textContent!.includes(nome))!;
    return label.querySelector('input')!;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CadastrarPaciente],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } },
      ],
    });
    fixture = TestBed.createComponent(CadastrarPaciente);
    c = fixture.componentInstance;
    fixture.detectChanges();
    confirmarResponsavel('Mãe', '529.982.247-25');
    confirmarResponsavel('Pai', '111.444.777-35');
  });

  it('1º endereço: os dois moram nele e não aparece "Quem mora aqui"; o 2º não coloca ninguém nele', () => {
    adicionarEndereco(A1);
    const a1 = c.enderecos.itens[0].chave;
    expect(residencias()).toEqual([[a1], [a1]]);
    expect(el().querySelectorAll('app-quem-mora-aqui').length).toBe(0);

    adicionarEndereco(A2);
    expect(residencias()).toEqual([[a1], [a1]]);
    expect(el().querySelectorAll('app-quem-mora-aqui').length).toBe(2);
    expect(checkbox(0, 'Pai').checked).toBe(true);
    expect(checkbox(1, 'Pai').checked).toBe(false);
  });

  it('pai no 2º e fora do 1º: payload mãe [0], pai [1] e o card mostra "Mora em"', () => {
    adicionarEndereco(A1);
    adicionarEndereco(A2);
    checkbox(1, 'Pai').click();
    checkbox(0, 'Pai').click();
    fixture.detectChanges();

    const dados = TestBed.inject(PacienteCadastroPayloadService).montar(formularios());
    expect(dados.responsaveis.map((r) => r.indicesEnderecoResidencia)).toEqual([[0], [1]]);
    expect(el().textContent).toContain('Mora em: Rua B, 20');
  });

  it('alguém desmarcado de todos: "Marque em qual endereço mora: …"', () => {
    adicionarEndereco(A1);
    adicionarEndereco(A2);
    checkbox(0, 'Mãe').click();
    fixture.detectChanges();

    expect(TestBed.inject(PacienteValidadorService).validar(formularios()).valido).toBe(false);
    expect(c.enderecos.erros['enderecos']).toBe('Marque em qual endereço mora: Mãe.');
  });

  it('remover o 2º endereço: quem morava só nele volta para o único que resta', () => {
    adicionarEndereco(A1);
    adicionarEndereco(A2);
    const [a1, a2] = c.enderecos.itens.map((i) => i.chave);
    checkbox(1, 'Pai').click();
    checkbox(0, 'Pai').click();
    expect(residencias()).toEqual([[a1], [a2]]);

    c.enderecos.remover(a2);
    fixture.detectChanges();
    expect(residencias()).toEqual([[a1], [a1]]);
    expect(el().querySelectorAll('app-quem-mora-aqui').length).toBe(0);
  });
});

describe('CadastrarPaciente: responsável que mora com outros pacientes (409)', () => {
  let fixture: ComponentFixture<CadastrarPaciente>;
  let c: CadastrarPaciente;
  let cadastrar: ReturnType<typeof vi.fn>;

  const ERRO_RESIDENCIA = new HttpErrorResponse({
    status: 409,
    error: {
      status: 409, message: 'Também reside com outros pacientes.', fields: {},
      residenciasEmOutrosPacientes: [{ idResponsavel: 31, outrosPacientes: 2 }],
    },
  });

  // Luana: cadastro existente (31) que passa a residir; Bruno: responsável novo.
  const LUANA: ResponsavelItem = {
    idResponsavel: 31, reaproveitado: true, nome: 'Luana Gomes', cpf: '529.982.247-25', dataNascimento: '1980-01-01',
    sexo: 'F', estadoCivil: 'CASADO', celular: '', ocupacao: '', grauParentesco: 'MAE', naoResideComPaciente: false,
    residencia: [], endereco: null, enderecoCadastro: null,
  };
  const BRUNO: ResponsavelItem = { ...LUANA, idResponsavel: undefined, reaproveitado: false, nome: 'Bruno', cpf: '111.444.777-35' };

  const dialogo = () => (fixture.nativeElement as HTMLElement).querySelector('app-dialogo-residencia-outros-pacientes .caixa');

  beforeEach(() => {
    cadastrar = vi.fn();
    TestBed.configureTestingModule({
      imports: [CadastrarPaciente],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } },
        { provide: PacienteService, useValue: { cadastrar } },
      ],
    });
    // A validação do formulário inteiro já tem testes próprios; aqui só interessa o salvamento.
    vi.spyOn(TestBed.inject(PacienteValidadorService), 'validar').mockReturnValue({ valido: true });
    fixture = TestBed.createComponent(CadastrarPaciente);
    c = fixture.componentInstance;
    fixture.detectChanges();
    c.enderecos.adicionar({ ...A1 });
    c.infoResponsavel.listaResponsaveis.push({ ...LUANA }, { ...BRUNO });
    fixture.detectChanges();
  });

  it('409 abre o diálogo com o nome do responsável e "2 outros pacientes", sem erro na tela', async () => {
    cadastrar.mockReturnValueOnce(throwError(() => ERRO_RESIDENCIA));

    await c.salvarCadastro();
    fixture.detectChanges();

    expect(c.erro).toBe('');
    expect(dialogo()).not.toBeNull();
    expect(dialogo()!.textContent).toContain('Luana Gomes');
    expect(dialogo()!.textContent).toMatch(/2\s*outros pacientes/);
  });

  it('"Saiu de lá" refaz o POST com continuaComOutrosPacientes: false só nesse responsável', async () => {
    cadastrar
      .mockReturnValueOnce(throwError(() => ERRO_RESIDENCIA))
      .mockReturnValueOnce(of({ idCadastro: 99, nome: 'Paciente', cpf: '', statusPaciente: 'MATRICULADO', dataCadastro: '' }));

    await c.salvarCadastro();
    await c.confirmarResidenciasOutros(new Map([[31, false]]));

    expect(cadastrar).toHaveBeenCalledTimes(2);
    const reenvio = cadastrar.mock.calls[1][0] as PacienteCadastroPayload;
    expect(reenvio.responsaveis.map((r) => r.continuaComOutrosPacientes)).toEqual([false, undefined]);
    expect(c.residenciasOutros).toEqual([]);
  });
});
