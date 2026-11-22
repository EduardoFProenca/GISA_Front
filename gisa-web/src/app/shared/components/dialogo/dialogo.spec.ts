import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideIcons } from '@ng-icons/core';
import { ICONES_LUCIDE } from '../../icons';
import { Dialogo } from './dialogo';

@Component({
  imports: [Dialogo],
  template: `
    <app-dialogo id="a" [aberto]="abertoA()" titulo="Primeiro" (fechar)="fechouA = fechouA + 1">
      <p class="conteudo">Conteúdo</p>
    </app-dialogo>
    <app-dialogo id="b" [aberto]="abertoB()" titulo="Segundo" (fechar)="fechouB = fechouB + 1" />
  `,
})
class HostTeste {
  abertoA = signal(false);
  abertoB = signal(false);
  fechouA = 0;
  fechouB = 0;
}

describe('Dialogo', () => {
  let fixture: ComponentFixture<HostTeste>;
  let host: HostTeste;

  const raiz = () => fixture.nativeElement as HTMLElement;
  const em = (id: string, seletor: string) => raiz().querySelector(`#${id} ${seletor}`) as HTMLElement | null;

  async function abrir(a: boolean, b = false) {
    host.abertoA.set(a);
    host.abertoB.set(b);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function pressionarEsc() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostTeste],
      providers: [provideIcons(ICONES_LUCIDE)],
    }).compileComponents();

    fixture = TestBed.createComponent(HostTeste);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('não renderiza nada fechado', () => {
    expect(em('a', '.overlay')).toBeNull();
    expect(em('a', '.conteudo')).toBeNull();
  });

  it('aberto, tem role dialog, aria-modal e aria-labelledby apontando para o título', async () => {
    await abrir(true);
    const caixa = em('a', '[role="dialog"]')!;
    expect(caixa).not.toBeNull();
    expect(caixa.getAttribute('aria-modal')).toBe('true');
    const titulo = em('a', '.titulo')!;
    expect(titulo.textContent?.trim()).toBe('Primeiro');
    expect(caixa.getAttribute('aria-labelledby')).toBe(titulo.id);
    expect(em('a', '.conteudo')).not.toBeNull();
  });

  it('clicar no X emite fechar', async () => {
    await abrir(true);
    const x = em('a', 'button[aria-label="Fechar"]')!;
    x.click();
    expect(host.fechouA).toBe(1);
  });

  it('Esc emite fechar só no modal aberto', async () => {
    pressionarEsc();
    expect(host.fechouA).toBe(0);

    await abrir(true);
    pressionarEsc();
    expect(host.fechouA).toBe(1);
    expect(host.fechouB).toBe(0);
  });

  it('Esc já tratado por um componente interno (defaultPrevented) não fecha', async () => {
    await abrir(true);
    const evento = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    evento.preventDefault();
    document.dispatchEvent(evento);
    expect(host.fechouA).toBe(0);
  });

  it('clicar no overlay fecha; clicar dentro da caixa não', async () => {
    await abrir(true);
    em('a', '.conteudo')!.click();
    em('a', '.caixa')!.click();
    expect(host.fechouA).toBe(0);

    em('a', '.overlay')!.click();
    expect(host.fechouA).toBe(1);
  });

  it('duas instâncias abertas têm ids de título diferentes', async () => {
    await abrir(true, true);
    const idA = em('a', '.titulo')!.id;
    const idB = em('b', '.titulo')!.id;
    expect(idA).toBeTruthy();
    expect(idB).toBeTruthy();
    expect(idA).not.toBe(idB);
  });
});
