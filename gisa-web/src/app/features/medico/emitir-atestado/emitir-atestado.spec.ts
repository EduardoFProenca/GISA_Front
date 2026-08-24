import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmitirAtestado } from './emitir-atestado';

describe('EmitirAtestado', () => {
  let component: EmitirAtestado;
  let fixture: ComponentFixture<EmitirAtestado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmitirAtestado],
    }).compileComponents();

    fixture = TestBed.createComponent(EmitirAtestado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
