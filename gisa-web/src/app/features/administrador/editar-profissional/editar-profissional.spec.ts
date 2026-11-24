import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { EditarProfissional } from './editar-profissional';
import { ProfissionalService } from '../../../core/services/profissional';
import { ProfissionalDetalhe } from '../../../core/models/profissional.model';
import { OpcoesProfissionalService } from '../cadastrar-profissional/services/opcoes-profissional';
import { CadastroValidadorService } from '../cadastrar-profissional/services/cadastro-validador';

describe('EditarProfissional', () => {
  let component: EditarProfissional;
  let fixture: ComponentFixture<EditarProfissional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarProfissional],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarProfissional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra erro quando o id da rota é inválido', () => {
    expect(component.carregando()).toBe(false);
    expect(component.erro()).toBe('Profissional inválido.');
  });
});

describe('EditarProfissional: pacientes vinculados (assistente social)', () => {
  const DETALHE: ProfissionalDetalhe = {
    profissional: {
      pessoa: {
        idCadastro: 3, nome: 'Ana Assistente', cpf: '12345678909', dataNascimento: '1985-04-12', sexo: 'F',
        celular: null, numCNS: null, estadoCivil: 'CASADO', statusCadastro: 'ATIVO',
        enderecos: [{ cep: '01001000', rua: 'Praça da Sé', numero: '100', complemento: null, bairro: 'Sé', cidade: 'São Paulo', estado: 'SP' }],
      },
      email: 'ana@apae.org',
      cargo: { idCargo: 2, nome: 'Assistente Social', codigoCBO: '251605', tituloCBO: 'Assistente social' },
      usuario: null,
    },
    especialista: null,
    pj: null,
    assistenteSocial: {
      profissional: {} as never,
      registroConselho: 'CRESS-9/1',
      pacientes: [{ idCadastro: 50, nome: 'Paciente Um', cpfMascarado: '***.111.111-**', statusCadastro: 'ATIVO' }],
    },
  };

  async function montar() {
    const atualizar = vi.fn(() => of({}));
    const vincularPaciente = vi.fn(() => of({}));
    const desvincularPaciente = vi.fn((_idAs: number, _idPac: number) => of(undefined));
    TestBed.configureTestingModule({
      imports: [EditarProfissional],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '3' }) } } },
        {
          provide: ProfissionalService,
          useValue: { buscarDetalhe: () => of(DETALHE), atualizar, vincularPaciente, desvincularPaciente, concederAcesso: vi.fn() },
        },
        { provide: OpcoesProfissionalService, useValue: { carregar: () => of({ cargos: [], perfis: [], especialidades: [] }) } },
        // Os campos obrigatórios não são o assunto aqui.
        { provide: CadastroValidadorService, useValue: { validar: () => ({ valido: true }), jornadasCompletas: () => [] } },
      ],
    });
    const fixture = TestBed.createComponent(EditarProfissional);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, c: fixture.componentInstance, atualizar, vincularPaciente, desvincularPaciente };
  }

  it('mostra na edição a lista de pacientes vinculados', async () => {
    const { fixture } = await montar();
    const secao = fixture.nativeElement.querySelector('app-info-assistente-social') as HTMLElement;
    expect(secao.textContent).toContain('Paciente Um');
    expect(secao.querySelector('app-select-busca')).not.toBeNull();
  });

  it('remover e salvar: DELETE do vínculo depois do PATCH', async () => {
    const { c, atualizar, vincularPaciente, desvincularPaciente } = await montar();
    c.infoAssistenteSocialForm!.removerPaciente(50);
    expect(desvincularPaciente).not.toHaveBeenCalled();

    await c.salvarEdicao();

    expect(desvincularPaciente).toHaveBeenCalledTimes(1);
    expect(desvincularPaciente).toHaveBeenCalledWith(3, 50);
    expect(vincularPaciente).not.toHaveBeenCalled();
    expect(atualizar.mock.invocationCallOrder[0]).toBeLessThan(desvincularPaciente.mock.invocationCallOrder[0]);
    expect(c.erroGeral()).toBe('');
  });
});