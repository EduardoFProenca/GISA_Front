import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InfoResponsavel } from './info-responsavel';
import { ContatoForm, EnderecoForm, ResponsavelItem } from '../../models/formularios-paciente';

const ENDERECO_A: EnderecoForm = {
  cep: '18000-000', endereco: 'Rua A', numero: '10', complemento: '', bairro: 'Centro', cidade: 'Sorocaba', uf: 'SP',
};

function contatoVazio(): ContatoForm {
  return { cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '', erros: {} } as unknown as ContatoForm;
}

function reaproveitado(id: number, nome: string, cpf: string, endereco: EnderecoForm): ResponsavelItem {
  return {
    idResponsavel: id, nome, cpf, dataNascimento: '1980-01-01', sexo: 'F', estadoCivil: 'CASADO', celular: '',
    ocupacao: '', grauParentesco: 'MAE', naoResideComPaciente: false, endereco: null,
    reaproveitado: true, enderecoCadastro: { ...endereco },
  };
}

describe('InfoResponsavel: origem do endereço do paciente', () => {
  let c: InfoResponsavel;
  let paciente: ContatoForm;

  // Vincula A e aceita usar o endereço dele no paciente.
  function copiarDeA() {
    c.abrirFormulario();
    c.novoResponsavel = reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A);
    c.confirmarTrocaEndereco();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InfoResponsavel],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    c = TestBed.createComponent(InfoResponsavel).componentInstance;
    paciente = contatoVazio();
    c.contatoPaciente = paciente;
  });

  it('remover a origem e confirmar limpa o endereço do paciente', () => {
    copiarDeA();
    expect(paciente.endereco).toBe('Rua A');

    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBe(0);
    expect(c.listaResponsaveis.length).toBe(1);

    c.confirmarRemocaoEndereco();
    expect(c.listaResponsaveis.length).toBe(0);
    expect(paciente.cep).toBe('');
    expect(paciente.endereco).toBe('');
    expect(paciente.uf).toBe('');
    expect(c.origemEnderecoPaciente).toBeNull();
    expect(c.remocaoPendente).toBeNull();
  });

  it('remover a origem e manter deixa o endereço no paciente', () => {
    copiarDeA();
    c.removerResponsavel(0);
    c.manterEnderecoNaRemocao();
    expect(c.listaResponsaveis.length).toBe(0);
    expect(paciente.endereco).toBe('Rua A');
    expect(c.origemEnderecoPaciente).toBeNull();
  });

  it('endereço alterado à mão depois da cópia: não pergunta', () => {
    copiarDeA();
    paciente.numero = '99';
    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBeNull();
    expect(c.listaResponsaveis.length).toBe(0);
    expect(paciente.numero).toBe('99');
    expect(c.origemEnderecoPaciente).toBeNull();
  });

  it('remover quem não é a origem: não pergunta', () => {
    copiarDeA();
    c.listaResponsaveis.push({ ...reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_A), naoResideComPaciente: true });
    c.removerResponsavel(1);
    expect(c.remocaoPendente).toBeNull();
    expect(c.listaResponsaveis.length).toBe(1);
    expect(c.origemEnderecoPaciente?.nome).toBe('Ana');
  });

  it('outro responsável mora no mesmo endereço: a origem passa para ele', () => {
    copiarDeA();
    c.listaResponsaveis.push(reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_A));

    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBeNull();
    expect(c.listaResponsaveis.map((r) => r.nome)).toEqual(['Bruno']);
    expect(c.origemEnderecoPaciente?.nome).toBe('Bruno');
    expect(paciente.endereco).toBe('Rua A');

    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBe(0);
  });

  it('a origem passa a "não reside": a origem é esquecida', () => {
    copiarDeA();
    c.editarResponsavel(0);
    c.novoResponsavel.naoResideComPaciente = true;
    c.aoMudarResidencia();
    c.salvarResponsavel();
    expect(c.listaResponsaveis[0].naoResideComPaciente).toBe(true);
    expect(c.origemEnderecoPaciente).toBeNull();
  });

  it('remover um item acima do que está em edição mantém a edição no item certo', () => {
    c.listaResponsaveis = [
      { ...reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A), naoResideComPaciente: true },
      { ...reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_A), naoResideComPaciente: true },
    ];
    c.editarResponsavel(1);
    c.removerResponsavel(0);
    expect(c.indexEdicao).toBe(0);

    c.novoResponsavel.grauParentesco = 'PAI';
    c.salvarResponsavel();
    expect(c.listaResponsaveis.length).toBe(1);
    expect(c.listaResponsaveis[0].nome).toBe('Bruno');
    expect(c.listaResponsaveis[0].grauParentesco).toBe('PAI');
  });

  it('limpar() esquece a origem', () => {
    copiarDeA();
    c.limpar();
    expect(c.origemEnderecoPaciente).toBeNull();
  });
});
