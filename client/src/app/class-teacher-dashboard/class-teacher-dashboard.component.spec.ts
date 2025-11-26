import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassTeacherDashboardComponent } from './class-teacher-dashboard.component';

describe('ClassTeacherDashboardComponent', () => {
  let component: ClassTeacherDashboardComponent;
  let fixture: ComponentFixture<ClassTeacherDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassTeacherDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassTeacherDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
