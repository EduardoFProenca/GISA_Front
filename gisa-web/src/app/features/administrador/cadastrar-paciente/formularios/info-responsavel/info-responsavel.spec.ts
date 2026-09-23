import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoResponsavel } from './info-responsavel';

describe('InfoResponsavel', () => {
  let component: InfoResponsavel;
  let fixture: ComponentFixture<InfoResponsavel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoResponsavel],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoResponsavel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
