import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletePageComponent } from './complete-page.component';

describe('CompletePageComponent', () => {
  let component: CompletePageComponent;
  let fixture: ComponentFixture<CompletePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompletePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
