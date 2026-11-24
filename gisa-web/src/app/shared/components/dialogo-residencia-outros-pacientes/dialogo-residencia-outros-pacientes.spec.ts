import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogoResidenciaOutrosPacientes } from './dialogo-residencia-outros-pacientes';

const ITENS = [
  { idResponsavel: 31, nome: 'Luana Gomes', outrosPacientes: 2 },
  { idResponsavel: 32, nome: 'Carlos Gomes', outrosPacientes: 1 },
];

describe('DialogoResidenciaOutrosPacientes', () => {
  let fixture: ComponentFixture<DialogoResidenciaOutrosPacientes>;
  let c: DialogoResidenciaOutrosPacientes;

  function abrir() {
    fixture.componentRef.setInput('itens', ITENS);
    fixture.componentRef.setInput('aberto', true);
    fixture.detectChanges();
  }
  const el = () => fixture.nativeElement as HTMLElement;
  const salvar = () => el().querySelector('button[data-concluir]') as HTMLButtonElement;
  const radios = () => el().querySelectorAll<HTMLInputElement>('input[type="radio"]');

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DialogoResidenciaOutrosPacientes] });
    fixture = TestBed.createComponent(DialogoResidenciaOutrosPacientes);
    c = fixture.componentInstance;
  });

  it('uma pergunta por responsável, com o nome dele e a quantidade (singular e plural)', () => {
    abrir();
    expect(el().querySelectorAll('fieldset').length).toBe(2);
    expect(el().textContent).toContain('Luana Gomes');
    expect(el().textContent).toMatch(/2\s*outros pacientes/);
    expect(el().textContent).toMatch(/1\s*outro paciente\./);
    expect(radios().length).toBe(4);
  });

  it('Salvar só habilita com todas as respostas e emite as decisões', () => {
    abrir();
    let emitido: Map<number, boolean> | undefined;
    c.confirmar.subscribe((d) => (emitido = d));

    expect(salvar().disabled).toBe(true);
    radios()[0].click(); // 31: continua morando com eles
    fixture.detectChanges();
    expect(salvar().disabled).toBe(true);
    radios()[3].click(); // 32: saiu de lá
    fixture.detectChanges();
    expect(salvar().disabled).toBe(false);

    salvar().click();
    expect([...emitido!.entries()]).toEqual([[31, true], [32, false]]);
  });

  it('reabrir começa sem respostas', () => {
    abrir();
    c.escolher(31, true);
    c.escolher(32, true);
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
