import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { ICONES, ICONES_LUCIDE } from '../../icons';
import { Botao } from './botao';

@Component({
  imports: [Botao, RouterLink],
  template: `
    <button appBotao type="button" id="padrao">Salvar</button>
    <button appBotao type="button" id="com-icone" [icone]="icones.adicionar">Novo</button>
    <button appBotao type="button" id="somente-icone" somenteIcone [icone]="icones.menu"
      aria-label="Abrir menu"></button>
    <a appBotao routerLink="/minha-senha" variante="fantasma" id="link">Alterar senha</a>
  `,
})
class HostTeste {
  icones = ICONES;
}

describe('Botao', () => {
  let fixture: ComponentFixture<HostTeste>;

  const el = (id: string) => fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostTeste],
      providers: [provideRouter([]), provideIcons(ICONES_LUCIDE)],
    }).compileComponents();

    fixture = TestBed.createComponent(HostTeste);
    await fixture.whenStable();
  });

  it('usa primario e md por padrão', () => {
    const botao = el('padrao');
    expect(botao.getAttribute('data-variante')).toBe('primario');
    expect(botao.getAttribute('data-tamanho')).toBe('md');
    expect(botao.hasAttribute('data-somente-icone')).toBe(false);
  });

  it('renderiza ng-icon só quando recebe icone', () => {
    expect(el('com-icone').querySelector('ng-icon')).not.toBeNull();
    expect(el('padrao').querySelector('ng-icon')).toBeNull();
  });

  it('somenteIcone sem valor marca data-somente-icone', () => {
    expect(el('somente-icone').hasAttribute('data-somente-icone')).toBe(true);
  });

  it('funciona em <a> com routerLink', () => {
    const link = el('link');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('data-variante')).toBe('fantasma');
    expect(link.getAttribute('href')).toBe('/minha-senha');
  });
});
