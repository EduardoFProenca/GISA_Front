import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InfoResponsavel } from './info-responsavel';
import { EnderecoForm, ResponsavelItem } from '../../models/formularios-paciente';
import { ListaEnderecos } from '../../../../../shared/components/lista-enderecos/lista-enderecos';

const ENDERECO_A: EnderecoForm = {
  cep: '18000-000', endereco: 'Rua A', numero: '10', complemento: '', bairro: 'Centro', cidade: 'Sorocaba', uf: 'SP',
};
const ENDERECO_C: EnderecoForm = {
  cep: '18020-000', endereco: 'Rua C', numero: '30', complemento: '', bairro: 'Vila', cidade: 'Sorocaba', uf: 'SP',
};
const ENDERECO_B: EnderecoForm = {
  cep: '18010-000', endereco: 'Rua B', numero: '20', complemento: '', bairro: 'Jardim', cidade: 'Sorocaba', uf: 'SP',
};

function reaproveitado(id: number, nome: string, cpf: string, endereco: EnderecoForm): ResponsavelItem {
  return {
    idResponsavel: id, nome, cpf, dataNascimento: '1980-01-01', sexo: 'F', estadoCivil: 'CASADO', celular: '',
    ocupacao: '', grauParentesco: 'MAE', naoResideComPaciente: false, residencia: [], endereco: null,
    reaproveitado: true, enderecoCadastro: { ...endereco },
  };
}

describe('InfoResponsavel: endereços do paciente na lista', () => {
  let c: InfoResponsavel;
  let lista: ListaEnderecos;

  // Vincula A e aceita usar o endereço dele no paciente.
  function copiarDeA() {
    c.abrirFormulario();
    c.novoResponsavel = reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A);
    c.confirmarTrocaEndereco();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InfoResponsavel, ListaEnderecos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    c = TestBed.createComponent(InfoResponsavel).componentInstance;
    lista = TestBed.createComponent(ListaEnderecos).componentInstance;
    lista.obrigatorio = true;
    c.enderecosPaciente = lista;
  });

  it('B0: vincular A (paciente sem endereço), aceitar, remover A e "Remover endereço" deixa a lista vazia', () => {
    copiarDeA();
    expect(lista.itens.map((i) => i.endereco)).toEqual(['Rua A']);
    expect(c.origensEnderecoPaciente.map((o) => o.chave)).toEqual([lista.itens[0].chave]);

    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBe(0);
    expect(c.listaResponsaveis.length).toBe(1);

    c.confirmarRemocaoEndereco();
    expect(c.listaResponsaveis.length).toBe(0);
    expect(lista.itens.length).toBe(0);
    expect(c.origensEnderecoPaciente).toEqual([]);
    expect(c.remocaoPendente).toBeNull();
  });

  it('remover a origem e manter deixa o endereço na lista', () => {
    copiarDeA();
    c.removerResponsavel(0);
    c.manterEnderecoNaRemocao();
    expect(c.listaResponsaveis.length).toBe(0);
    expect(lista.itens.map((i) => i.endereco)).toEqual(['Rua A']);
    expect(c.origensEnderecoPaciente).toEqual([]);
  });

  it('endereço alterado à mão depois da cópia: não pergunta', () => {
    copiarDeA();
    lista.itens = lista.itens.map((i) => ({ ...i, numero: '99' }));
    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBeNull();
    expect(c.listaResponsaveis.length).toBe(0);
    expect(lista.itens[0].numero).toBe('99');
    expect(c.origensEnderecoPaciente).toEqual([]);
  });

  it('endereço copiado já removido da lista: não pergunta', () => {
    copiarDeA();
    lista.remover(lista.itens[0].chave);
    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBeNull();
    expect(c.listaResponsaveis.length).toBe(0);
    expect(c.origensEnderecoPaciente).toEqual([]);
  });

  it('remover quem não é a origem: não pergunta', () => {
    copiarDeA();
    c.listaResponsaveis.push({ ...reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_A), naoResideComPaciente: true });
    c.removerResponsavel(1);
    expect(c.remocaoPendente).toBeNull();
    expect(c.listaResponsaveis.length).toBe(1);
    expect(c.origensEnderecoPaciente.map((o) => o.nome)).toEqual(['Ana']);
  });

  it('outro responsável mora no mesmo endereço: a origem passa para ele', () => {
    copiarDeA();
    c.listaResponsaveis.push({ ...reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_A), residencia: [lista.itens[0].chave] });

    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBeNull();
    expect(c.listaResponsaveis.map((r) => r.nome)).toEqual(['Bruno']);
    expect(c.origensEnderecoPaciente.map((o) => o.nome)).toEqual(['Bruno']);
    expect(lista.itens.length).toBe(1);

    c.removerResponsavel(0);
    expect(c.remocaoPendente).toBe(0);
  });

  // B2, RN09: o endereço dela é o que foi copiado para o paciente; dividir o endereço é residir (D1).
  it('a origem não pode passar a "não reside" com o endereço que deu ao paciente', () => {
    copiarDeA();
    c.editarResponsavel(0);
    c.novoResponsavel.naoResideComPaciente = true;
    c.aoMudarResidencia();
    c.salvarResponsavel();
    expect(c.errosCard['residencia']).toContain('Este é um endereço do paciente');
    expect(c.listaResponsaveis[0].naoResideComPaciente).toBe(false);
    expect(c.origensEnderecoPaciente.map((o) => o.nome)).toEqual(['Ana']);
  });

  it('responsável cadastrado que reside, paciente sem endereço: oferece copiar', () => {
    c.abrirFormulario();
    c.novoResponsavel = reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A);
    c.salvarResponsavel();
    expect(c.confirmarEnderecoAberto).toBe(true);
    expect(c.listaResponsaveis.length).toBe(0);
  });

  it('responsável cadastrado que reside, com o mesmo endereço em qualquer posição da lista: aceita', () => {
    lista.adicionar({ ...ENDERECO_B });
    lista.adicionar({ ...ENDERECO_A, cep: '18000000', endereco: 'rua a' });
    c.abrirFormulario();
    c.novoResponsavel = reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A);
    c.salvarResponsavel();
    expect(c.confirmarEnderecoAberto).toBe(false);
    expect(c.errosCard['residencia']).toBeUndefined();
    expect(c.listaResponsaveis.length).toBe(1);
  });

  it('responsável cadastrado que reside, com endereço fora da lista: abre "Endereço diferente"', () => {
    lista.adicionar({ ...ENDERECO_B });
    c.abrirFormulario();
    c.novoResponsavel = reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A);
    c.salvarResponsavel();
    expect(c.enderecoDiferenteAberto).toBe(true);
    expect(c.confirmarEnderecoAberto).toBe(false);
    expect(c.errosCard['residencia']).toBeUndefined();
    expect(c.listaResponsaveis.length).toBe(0);
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
    expect(c.origensEnderecoPaciente).toEqual([]);
  });

  it('com 2 endereços, confirmar um responsável novo pré-marca os endereços livres', () => {
    lista.adicionar({ ...ENDERECO_A });
    lista.adicionar({ ...ENDERECO_B });
    const [a, b] = lista.itens.map((i) => i.chave);
    c.listaResponsaveis.push({ ...reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A), residencia: [a] });

    c.abrirFormulario();
    Object.assign(c.novoResponsavel, {
      nome: 'Bruno', cpf: '111.444.777-35', dataNascimento: '1980-01-01', sexo: 'M', estadoCivil: 'CASADO', grauParentesco: 'PAI',
    });
    c.salvarResponsavel();

    expect(c.listaResponsaveis[1].residencia).toEqual([b]);
  });

  it('com 2 endereços, cadastro existente com endereço igual a um do paciente: marca esse', () => {
    lista.adicionar({ ...ENDERECO_A });
    lista.adicionar({ ...ENDERECO_B });
    const b = lista.itens[1].chave;

    c.abrirFormulario();
    c.novoResponsavel = reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_B);
    c.salvarResponsavel();

    expect(c.listaResponsaveis[0].residencia).toEqual([b]);
    expect(c.moraEm(c.listaResponsaveis[0])).toBe('Rua B, 20');
  });

  it('editar quem já tem endereço marcado não refaz a sugestão', () => {
    lista.adicionar({ ...ENDERECO_A });
    lista.adicionar({ ...ENDERECO_B });
    const [a, b] = lista.itens.map((i) => i.chave);
    c.listaResponsaveis = [
      { ...reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A), residencia: [a, b] },
    ];
    c.editarResponsavel(0);
    c.novoResponsavel.celular = '(15) 99999-0000';
    c.salvarResponsavel();
    expect(c.listaResponsaveis[0].residencia).toEqual([a, b]);
  });

  it('"não reside" de quem morava no endereço do paciente: o endereço próprio começa vazio', () => {
    lista.adicionar({ ...ENDERECO_A });
    c.listaResponsaveis = [{
      ...reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A), reaproveitado: false, resideAntes: true,
      residencia: [lista.itens[0].chave],
    }];
    c.editarResponsavel(0);
    c.novoResponsavel.naoResideComPaciente = true;
    c.aoMudarResidencia();
    expect(c.novoResponsavel.endereco).toBeNull();
  });

  it('"não reside" com endereço próprio igual a um do paciente: erro no card', () => {
    lista.adicionar({ ...ENDERECO_A });
    c.abrirFormulario();
    c.novoResponsavel = { ...reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A), naoResideComPaciente: true };
    c.salvarResponsavel();
    expect(c.errosCard['residencia']).toContain('Este é um endereço do paciente');
    expect(c.listaResponsaveis.length).toBe(0);
  });

  describe('"Endereço diferente" (B3)', () => {
    // Paciente com a1; Bruno já cadastrado, mora em e2 e reside.
    function confirmarBrunoEmE2() {
      lista.adicionar({ ...ENDERECO_A });
      c.abrirFormulario();
      c.novoResponsavel = reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_B);
      c.salvarResponsavel();
      expect(c.enderecoDiferenteAberto).toBe(true);
    }

    it('"Adicionar como endereço do paciente": lista com a1 e e2 e ele mora em e2', () => {
      confirmarBrunoEmE2();
      c.adicionarComoEnderecoDoPaciente();
      expect(c.enderecoDiferenteAberto).toBe(false);
      expect(lista.itens.map((i) => i.endereco)).toEqual(['Rua A', 'Rua B']);
      expect(c.listaResponsaveis[0].residencia).toEqual([lista.itens[1].chave]);
      expect(c.exibindoFormulario).toBe(false);
    });

    it('"Morar no endereço do paciente": lista só com a1 e ele mora em a1', () => {
      confirmarBrunoEmE2();
      c.morarNoEnderecoDoPaciente();
      expect(lista.itens.length).toBe(1);
      expect(c.listaResponsaveis[0].residencia).toEqual([lista.itens[0].chave]);
      expect(c.listaResponsaveis[0].naoResideComPaciente).toBe(false);
    });

    it('"Não reside": card aberto, checkbox marcado e endereço dele mantido', () => {
      confirmarBrunoEmE2();
      c.marcarQueNaoReside();
      expect(c.exibindoFormulario).toBe(true);
      expect(c.listaResponsaveis.length).toBe(0);
      expect(c.novoResponsavel.naoResideComPaciente).toBe(true);
      expect(c.novoResponsavel.endereco?.endereco).toBe('Rua B');
    });

    it('fechar mantém o card aberto e não confirma', () => {
      confirmarBrunoEmE2();
      c.fecharEnderecoDiferente();
      expect(c.enderecoDiferenteAberto).toBe(false);
      expect(c.exibindoFormulario).toBe(true);
      expect(c.listaResponsaveis.length).toBe(0);
    });

    it('dois cadastros existentes, cada um com seu endereço, os dois "Adicionar": cada um mora no seu', () => {
      lista.adicionar({ ...ENDERECO_C });
      c.abrirFormulario();
      c.novoResponsavel = reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A);
      c.salvarResponsavel();
      c.adicionarComoEnderecoDoPaciente();
      c.abrirFormulario();
      c.novoResponsavel = reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_B);
      c.salvarResponsavel();
      expect(c.enderecoDiferenteAberto).toBe(true);
      c.adicionarComoEnderecoDoPaciente();

      const [, a, b] = lista.itens.map((i) => i.chave);
      expect(c.listaResponsaveis.map((r) => r.residencia)).toEqual([[a], [b]]);
    });

    it('remover quem trouxe e2, sem outro morando nele: pergunta e pode remover e2', () => {
      confirmarBrunoEmE2();
      c.adicionarComoEnderecoDoPaciente();
      c.removerResponsavel(0);
      expect(c.remocaoPendente).toBe(0);
      expect(c.textoEnderecosDaRemocao).toContain('Rua B');

      c.confirmarRemocaoEndereco();
      expect(lista.itens.map((i) => i.endereco)).toEqual(['Rua A']);
      expect(c.listaResponsaveis.length).toBe(0);
    });

    it('remover quem trouxe e2, com outro morando nele: não pergunta e e2 fica', () => {
      confirmarBrunoEmE2();
      c.adicionarComoEnderecoDoPaciente();
      const e2 = lista.itens[1].chave;
      c.listaResponsaveis.push({ ...reaproveitado(3, 'Carla', '123.456.789-09', ENDERECO_A), residencia: [e2] });

      c.removerResponsavel(0);
      expect(c.remocaoPendente).toBeNull();
      expect(lista.itens.length).toBe(2);
    });

    it('cópias de dois responsáveis: remover um só pergunta pelo endereço dele', () => {
      c.abrirFormulario();
      c.novoResponsavel = reaproveitado(1, 'Ana', '529.982.247-25', ENDERECO_A);
      c.salvarResponsavel();
      c.confirmarTrocaEndereco(); // lista vazia: "Usar no paciente"
      c.abrirFormulario();
      c.novoResponsavel = reaproveitado(2, 'Bruno', '111.444.777-35', ENDERECO_B);
      c.salvarResponsavel();
      c.adicionarComoEnderecoDoPaciente();
      expect(c.origensEnderecoPaciente.map((o) => o.nome)).toEqual(['Ana', 'Bruno']);

      c.removerResponsavel(1);
      expect(c.textoEnderecosDaRemocao).toContain('Rua B');
      expect(c.textoEnderecosDaRemocao).not.toContain('Rua A');
      c.manterEnderecoNaRemocao();
      expect(lista.itens.length).toBe(2);
      expect(c.origensEnderecoPaciente.map((o) => o.nome)).toEqual(['Ana']);
    });
  });
});
