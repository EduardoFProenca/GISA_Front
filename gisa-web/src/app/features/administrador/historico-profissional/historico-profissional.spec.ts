import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoProfissional } from './historico-profissional';

describe('HistoricoProfissional', () => {
  let component: HistoricoProfissional;
  let fixture: ComponentFixture<HistoricoProfissional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoProfissional],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoProfissional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
