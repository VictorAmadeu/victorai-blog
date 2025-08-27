import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PythonDetailComponent } from './python-detail.component';

describe('PythonDetailComponent', () => {
  let component: PythonDetailComponent;
  let fixture: ComponentFixture<PythonDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PythonDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PythonDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
