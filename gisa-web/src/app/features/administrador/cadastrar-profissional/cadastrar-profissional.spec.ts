import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastrarProfissional } from './cadastrar-profissional';

describe('CadastrarProfissional', () => {
  let component: CadastrarProfissional;
  let fixture: ComponentFixture<CadastrarProfissional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarProfissional],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastrarProfissional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
