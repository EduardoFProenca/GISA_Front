import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogoEnderecoCompartilhado } from './dialogo-endereco-compartilhado';

const ITENS = [
  { idEndereco: 12, texto: 'Rua A, 10 - Centro, Sorocaba/SP', outrosCadastros: 2 },
  { idEndereco: 15, texto: 'Rua B, 20 - Jardim, Sorocaba/SP', outrosCadastros: 1 },
];

describe('DialogoEnderecoCompartilhado', () => {
  let fixture: ComponentFixture<DialogoEnderecoCompartilhado>;
  let c: DialogoEnderecoCompartilhado;

  function abrir() {
    fixture.componentRef.setInput('itens', ITENS);
    fixture.componentRef.setInput('aberto', true);
    fixture.detectChanges();
  }
  const el = () => fixture.nativeElement as HTMLElement;
  const salvar = () => el().querySelector('button[data-concluir]') as HTMLButtonElement;
  const radios = () => el().querySelectorAll<HTMLInputElement>('input[type="radio"]');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DialogoEnderecoCompartilhado] });
    fixture = TestBed.createComponent(DialogoEnderecoCompartilhado);
    c = fixture.componentInstance;
  });

  it('uma pergunta por endereço, com a quantidade e sem nomes', () => {
    abrir();
    expect(el().querySelectorAll('fieldset').length).toBe(2);
    expect(el().textContent).toContain('Rua A, 10');
    expect(el().textContent).toMatch(/2\s*outros cadastros/);
    expect(el().textContent).toMatch(/1\s*outro cadastro\./);
    expect(radios().length).toBe(4);
  });

  it('Salvar só habilita com todas as perguntas respondidas e emite as decisões', () => {
    abrir();
    let emitido: Map<number, boolean> | undefined;
    c.confirmar.subscribe((d) => (emitido = d));

    expect(salvar().disabled).toBe(true);
    radios()[0].click(); // 12: corrigir para todos
    fixture.detectChanges();
    expect(salvar().disabled).toBe(true);
    radios()[3].click(); // 15: só para este cadastro
    fixture.detectChanges();
    expect(salvar().disabled).toBe(false);

    salvar().click();
    expect([...emitido!.entries()]).toEqual([[12, true], [15, false]]);
  });

  it('reabrir começa sem respostas', () => {
    abrir();
    c.escolher(12, true);
    c.escolher(15, true);
    fixture.componentRef.setInput('aberto', false);
    fixture.detectChanges();
    abrir();
    expect(c.decisoes.size).toBe(0);
    expect(salvar().disabled).toBe(true);
  });

  it('Voltar emite cancelar', () => {
    abrir();
    let cancelou = false;
    c.cancelar.subscribe(() => (cancelou = true));
    (el().querySelector('.dialogo-acoes button') as HTMLButtonElement).click();
    expect(cancelou).toBe(true);
  });
});
