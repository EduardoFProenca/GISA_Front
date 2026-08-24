import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerenciarMedico } from './gerenciar-medico';

describe('GerenciarMedico', () => {
  let component: GerenciarMedico;
  let fixture: ComponentFixture<GerenciarMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarMedico],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarMedico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
