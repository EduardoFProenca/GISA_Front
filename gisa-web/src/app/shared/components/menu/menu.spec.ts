import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Layout } from '../../../core/layout/layout';
import { Menu } from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
  let layout: Layout;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Menu],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    layout = TestBed.inject(Layout);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('alterna aberto/fechado pelo Layout', () => {
    layout.menuAberto.set(false);
    expect(component.menuFechado).toBe(true);

    layout.toggleMenu();
    expect(component.menuFechado).toBe(false);
  });

  it('fecha com Esc quando está aberto', () => {
    layout.menuAberto.set(true);

    component.aoPressionarEsc();
    expect(component.menuFechado).toBe(true);
  });
});