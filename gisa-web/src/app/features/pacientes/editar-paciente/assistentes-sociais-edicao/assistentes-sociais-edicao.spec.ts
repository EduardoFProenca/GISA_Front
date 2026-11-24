import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AssistentesSociaisEdicao } from './assistentes-sociais-edicao';

const A = { idCadastro: 1, nome: 'Ana' };
const B = { idCadastro: 2, nome: 'Bia' };

describe('AssistentesSociaisEdicao', () => {
  let fixture: ComponentFixture<AssistentesSociaisEdicao>;
  let c: AssistentesSociaisEdicao;
  const el = () => fixture.nativeElement as HTMLElement;

  function montar(podeAlterar: boolean) {
    fixture = TestBed.createComponent(AssistentesSociaisEdicao);
    c = fixture.componentInstance;
    fixture.componentRef.setInput('iniciais', [A, B]);
    fixture.componentRef.setInput('podeAlterar', podeAlterar);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AssistentesSociaisEdicao],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('novos() e removidos() comparam a lista com o que a API tem', () => {
    montar(true);
    c.remover(1);
    c.adicionar({ id: 3, label: 'Cris · CRESS 1', rotuloSelecionado: 'Cris' });
    expect(c.novos()).toEqual([3]);
    expect(c.removidos()).toEqual([1]);
    expect(c.nome(3)).toBe('Cris');
    expect(c.nome(1)).toBe('Ana');

    c.marcarSalvo(3, true);
    expect(c.novos()).toEqual([]);
  });

  it('sem podeAlterar: lista sem "Remover" e sem campo de vincular', () => {
    montar(false);
    expect(el().textContent).toContain('Ana');
    expect(el().querySelectorAll('button').length).toBe(0);
    expect(el().querySelector('app-select-busca')).toBeNull();
  });

  it('com podeAlterar: mostra "Remover" e o campo de vincular', () => {
    montar(true);
    expect(el().querySelectorAll('button[aria-label^="Remover"]').length).toBe(2);
    expect(el().querySelector('app-select-busca')).not.toBeNull();
  });

  it('depois de adicionar, o campo de busca volta a vazio', async () => {
    montar(true);
    c.adicionar({ id: 3, label: 'Cris', rotuloSelecionado: 'Cris' });
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(c.selecao()).toBeNull();
    expect(c.lista().map((a) => a.idCadastro)).toEqual([1, 2, 3]);
  });
});
