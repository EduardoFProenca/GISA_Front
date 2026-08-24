import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmitirReceita } from './emitir-receita';

describe('EmitirReceita', () => {
  let component: EmitirReceita;
  let fixture: ComponentFixture<EmitirReceita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmitirReceita],
    }).compileComponents();

    fixture = TestBed.createComponent(EmitirReceita);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
