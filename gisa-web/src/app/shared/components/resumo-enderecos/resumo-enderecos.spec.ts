import { TestBed } from '@angular/core/testing';
import { Endereco } from '../../../core/models/comum.model';
import { ResumoEnderecos } from './resumo-enderecos';

function endereco(id: number): Endereco {
  return {
    idEndereco: id, cep: '18000000', rua: `Rua ${id}`, numero: String(id), complemento: null,
    bairro: 'Centro', cidade: 'Sorocaba', estado: 'SP',
  };
}

function montar(enderecos: Endereco[]) {
  const fixture = TestBed.createComponent(ResumoEnderecos);
  fixture.componentRef.setInput('enderecos', enderecos);
  fixture.detectChanges();
  const el: HTMLElement = fixture.nativeElement;
  return {
    fixture,
    el,
    blocos: () => el.querySelectorAll('.info-bloco').length,
    tags: () => el.querySelectorAll('.tag').length,
    botao: () => el.querySelector('button'),
  };
}

describe('ResumoEnderecos', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [ResumoEnderecos] }));

  it('sem endereços: mostra o texto vazio', () => {
    const t = montar([]);
    expect(t.el.textContent).toContain('Sem endereço informado.');
    expect(t.blocos()).toBe(0);
  });

  it('1 endereço: um bloco, sem tag e sem botão, CEP formatado', () => {
    const t = montar([endereco(1)]);
    expect(t.blocos()).toBe(1);
    expect(t.tags()).toBe(0);
    expect(t.botao()).toBeNull();
    expect(t.el.textContent).toContain('18000-000');
  });

  it('2 endereços: dois blocos e a tag Principal só no primeiro, sem botão', () => {
    const t = montar([endereco(1), endereco(2)]);
    expect(t.blocos()).toBe(2);
    expect(t.tags()).toBe(1);
    expect(t.el.querySelector('.card-endereco .tag')?.textContent).toContain('Principal');
    expect(t.botao()).toBeNull();
  });

  it('3 endereços: dois blocos, tag no primeiro e "Ver mais (+1)"; clicar mostra os três e "Ver menos"', () => {
    const t = montar([endereco(1), endereco(2), endereco(3)]);
    expect(t.blocos()).toBe(2);
    expect(t.tags()).toBe(1);
    expect(t.botao()?.textContent?.trim()).toBe('Ver mais (+1)');

    t.botao()!.click();
    t.fixture.detectChanges();
    expect(t.blocos()).toBe(3);
    expect(t.botao()?.textContent?.trim()).toBe('Ver menos');

    t.botao()!.click();
    t.fixture.detectChanges();
    expect(t.blocos()).toBe(2);
  });

  it('não reordena: mantém a ordem recebida', () => {
    const t = montar([endereco(5), endereco(2)]);
    const textos = Array.from(t.el.querySelectorAll('.info-bloco')).map((b) => b.textContent);
    expect(textos[0]).toContain('Rua 5');
    expect(textos[1]).toContain('Rua 2');
  });
});
