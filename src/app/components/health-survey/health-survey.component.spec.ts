import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthSurveyComponent } from './health-survey.component';

describe('HealthSurveyComponent', () => {
  let component: HealthSurveyComponent;
  let fixture: ComponentFixture<HealthSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthSurveyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HealthSurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
