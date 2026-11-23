import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Endereco } from '../../../core/models/comum.model';
import { EnderecoForm } from '../../utils/endereco.util';
import { Contato } from '../contato/contato';
import { ListaEnderecos } from './lista-enderecos';

const ENDERECO_A: Endereco = {
  idEndereco: 1, cep: '18000000', rua: 'Rua A', numero: '10', complemento: null, bairro: 'Centro', cidade: 'Sorocaba', estado: 'SP',
};
const ENDERECO_B: Endereco = {
  idEndereco: 2, cep: '18010000', rua: 'Rua B', numero: '20', complemento: 'apto 2', bairro: 'Jardim', cidade: 'Sorocaba', estado: 'SP',
};
const FORM_C: EnderecoForm = {
  cep: '18020-000', endereco: 'Rua C', numero: '30', complemento: '', bairro: 'Vila', cidade: 'Sorocaba', uf: 'SP',
};

// Os testes não renderizam o app-contato: simulam o que o usuário digitou nele.
function preencher(c: ListaEnderecos, valores: Partial<EnderecoForm>) {
  const vazio: EnderecoForm = { cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' };
  c.contato = { ...vazio, ...valores, erros: {} } as unknown as Contato;
}

describe('ListaEnderecos', () => {
  let c: ListaEnderecos;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaEnderecos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    c = TestBed.createComponent(ListaEnderecos).componentInstance;
  });

  it('iniciais com 2 endereços: chaves id-… e o primeiro é o principal', () => {
    c.enderecosIniciais = [ENDERECO_A, ENDERECO_B];
    expect(c.itens.map((i) => i.chave)).toEqual(['id-1', 'id-2']);
    expect(c.itens[0].cep).toBe('18000-000');
  });

  it('adicionar e confirmar: item novo sem idEndereco e emite mudou', () => {
    const mudou = vi.fn();
    c.mudou.subscribe(mudou);
    c.abrirFormulario();
    preencher(c, FORM_C);
    c.confirmar();

    expect(c.itens.length).toBe(1);
    expect(c.itens[0].chave).toMatch(/^novo-/);
    expect(c.itens[0].idEndereco).toBeUndefined();
    expect(c.exibindoFormulario).toBe(false);
    expect(mudou).toHaveBeenCalledTimes(1);
  });

  it('confirmar com campos faltando mostra os erros e não confirma', () => {
    c.abrirFormulario();
    preencher(c, { cep: '18020-000', endereco: 'Rua C' });
    c.confirmar();

    expect(c.itens.length).toBe(0);
    expect(c.contato!.erros['numero']).toBeTruthy();
    expect(c.contato!.erros['uf']).toBeTruthy();
  });

  it('confirmar endereço repetido: erro e lista igual', () => {
    c.enderecosIniciais = [ENDERECO_A];
    c.abrirFormulario();
    preencher(c, { cep: '18000-000', endereco: 'rua a', numero: '10', bairro: 'Centro', cidade: 'Sorocaba', uf: 'SP' });
    c.confirmar();

    expect(c.erroCard).toBe('Este endereço já está na lista.');
    expect(c.itens.length).toBe(1);
  });

  it('obrigatório e lista vazia: formulário aberto, sem Cancelar; validar() pede um endereço', () => {
    c.obrigatorio = true;
    c.ngOnInit();
    expect(c.exibindoFormulario).toBe(true);
    expect(c.podeCancelar).toBe(false);

    preencher(c, {});
    expect(c.validar()).toBe(false);
    expect(c.erros['enderecos']).toBe('Informe ao menos um endereço.');
  });

  it('formulário com algo preenchido: validar() pede para confirmar ou cancelar', () => {
    c.abrirFormulario();
    preencher(c, { cep: '18020-000' });
    expect(c.validar()).toBe(false);
    expect(c.erros['enderecos']).toBe('Confirme ou cancele o endereço que está sendo preenchido.');
  });

  it('formulário vazio com a lista preenchida: validar() ignora', () => {
    c.obrigatorio = true;
    c.enderecosIniciais = [ENDERECO_A];
    c.abrirFormulario();
    preencher(c, {});
    expect(c.validar()).toBe(true);
  });

  it('remover o último item de lista obrigatória reabre o formulário', () => {
    c.obrigatorio = true;
    c.enderecosIniciais = [ENDERECO_A];
    c.remover('id-1');
    expect(c.itens.length).toBe(0);
    expect(c.exibindoFormulario).toBe(true);
  });

  it('paraApi mantém idEndereco e a ordem', () => {
    c.enderecosIniciais = [ENDERECO_A, ENDERECO_B];
    c.adicionar(FORM_C);
    const api = c.paraApi();
    expect(api.map((e) => e.idEndereco)).toEqual([1, 2, undefined]);
    expect(api.map((e) => e.rua)).toEqual(['Rua A', 'Rua B', 'Rua C']);
    expect(api[1].complemento).toBe('apto 2');
    expect(api[2].cep).toBe('18020000');
  });

  it('aplicarDecisoes marca só os endereços respondidos, e paraApi envia a resposta', () => {
    c.enderecosIniciais = [ENDERECO_A, ENDERECO_B];
    c.aplicarDecisoes(new Map([[1, true]]));

    const api = c.paraApi() as { idEndereco?: number; alterarParaTodos?: boolean }[];
    expect(api[0].alterarParaTodos).toBe(true);
    expect(api[1].alterarParaTodos).toBeUndefined();
  });

  it('editar de novo o endereço respondido apaga a resposta', () => {
    c.enderecosIniciais = [ENDERECO_A];
    c.aplicarDecisoes(new Map([[1, false]]));
    c.editar(0);
    preencher(c, { cep: '18000-000', endereco: 'Rua A', numero: '11', bairro: 'Centro', cidade: 'Sorocaba', uf: 'SP' });
    c.confirmar();

    expect(c.itens[0].idEndereco).toBe(1);
    expect(c.itens[0].alterarParaTodos).toBeUndefined();
  });
});
