import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoEscola } from './info-escola';

describe('InfoEscola', () => {
  let component: InfoEscola;
  let fixture: ComponentFixture<InfoEscola>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoEscola],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoEscola);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
