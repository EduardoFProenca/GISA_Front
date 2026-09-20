import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CabecalhoPagina } from './cabecalho-pagina';

describe('CabecalhoPagina', () => {
  let component: CabecalhoPagina;
  let fixture: ComponentFixture<CabecalhoPagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabecalhoPagina],
    }).compileComponents();

    fixture = TestBed.createComponent(CabecalhoPagina);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
