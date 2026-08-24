import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizarDadosSaude } from './visualizar-dados-saude';

describe('VisualizarDadosSaude', () => {
  let component: VisualizarDadosSaude;
  let fixture: ComponentFixture<VisualizarDadosSaude>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarDadosSaude],
    }).compileComponents();

    fixture = TestBed.createComponent(VisualizarDadosSaude);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
