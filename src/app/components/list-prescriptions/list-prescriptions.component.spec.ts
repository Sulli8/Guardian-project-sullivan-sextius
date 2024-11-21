import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPrescriptionsComponent } from './list-prescriptions.component';

describe('PrescriptionComponent', () => {
  let component: ListPrescriptionsComponent;
  let fixture: ComponentFixture<ListPrescriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPrescriptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListPrescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
