import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltroAvancado } from './filtro-avancado';

describe('FiltroAvancado', () => {
  let component: FiltroAvancado;
  let fixture: ComponentFixture<FiltroAvancado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroAvancado],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroAvancado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
