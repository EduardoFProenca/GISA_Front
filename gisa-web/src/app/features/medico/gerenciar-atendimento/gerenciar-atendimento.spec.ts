import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerenciarAtendimento } from './gerenciar-atendimento';

describe('GerenciarAtendimento', () => {
  let component: GerenciarAtendimento;
  let fixture: ComponentFixture<GerenciarAtendimento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarAtendimento],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarAtendimento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
