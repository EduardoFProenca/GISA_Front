import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerenciarAgendaMedico } from './gerenciar-agenda-medico';

describe('GerenciarAgendaMedico', () => {
  let component: GerenciarAgendaMedico;
  let fixture: ComponentFixture<GerenciarAgendaMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarAgendaMedico],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarAgendaMedico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
