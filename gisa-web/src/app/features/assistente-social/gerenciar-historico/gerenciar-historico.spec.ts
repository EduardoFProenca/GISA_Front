import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GerenciarHistorico } from './gerenciar-historico';

describe('GerenciarHistorico', () => {
  let component: GerenciarHistorico;
  let fixture: ComponentFixture<GerenciarHistorico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GerenciarHistorico],
    }).compileComponents();

    fixture = TestBed.createComponent(GerenciarHistorico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
