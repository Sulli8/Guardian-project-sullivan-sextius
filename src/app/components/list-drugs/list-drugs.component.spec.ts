import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDrugsComponent } from './list-drugs.component';

describe('ListDrugsComponent', () => {
  let component: ListDrugsComponent;
  let fixture: ComponentFixture<ListDrugsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDrugsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListDrugsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
