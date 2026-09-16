import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardAssistenteSocial } from './dashboard';

describe('DashboardAssistenteSocial', () => {
  let component: DashboardAssistenteSocial;
  let fixture: ComponentFixture<DashboardAssistenteSocial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAssistenteSocial],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAssistenteSocial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});