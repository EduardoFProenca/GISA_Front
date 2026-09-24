import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarProfissional } from './editar-profissional';

describe('EditarProfissional', () => {
  let component: EditarProfissional;
  let fixture: ComponentFixture<EditarProfissional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarProfissional],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarProfissional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
