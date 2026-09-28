import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriarConsulta } from './criar-consulta';

describe('CriarConsulta', () => {
  let component: CriarConsulta;
  let fixture: ComponentFixture<CriarConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriarConsulta],
    }).compileComponents();

    fixture = TestBed.createComponent(CriarConsulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
