import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmitirRecusa } from './emitir-recusa';

describe('EmitirRecusa', () => {
  let component: EmitirRecusa;
  let fixture: ComponentFixture<EmitirRecusa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmitirRecusa],
    }).compileComponents();

    fixture = TestBed.createComponent(EmitirRecusa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
