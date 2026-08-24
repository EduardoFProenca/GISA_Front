import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistrarPresenca } from './registrar-presenca';

describe('RegistrarPresenca', () => {
  let component: RegistrarPresenca;
  let fixture: ComponentFixture<RegistrarPresenca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarPresenca],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarPresenca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
