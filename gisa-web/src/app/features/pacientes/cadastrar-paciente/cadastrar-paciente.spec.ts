import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
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
