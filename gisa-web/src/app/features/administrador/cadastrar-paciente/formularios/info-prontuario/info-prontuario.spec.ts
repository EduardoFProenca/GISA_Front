import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoProntuario } from './info-prontuario';

describe('InfoProntuario', () => {
  let component: InfoProntuario;
  let fixture: ComponentFixture<InfoProntuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoProntuario],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoProntuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
