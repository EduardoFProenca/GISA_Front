import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectBusca } from './select-busca';

describe('SelectBusca', () => {
  let component: SelectBusca;
  let fixture: ComponentFixture<SelectBusca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectBusca],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectBusca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
