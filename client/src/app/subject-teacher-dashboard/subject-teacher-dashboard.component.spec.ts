import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectTeacherDashboardComponent } from './subject-teacher-dashboard.component';

describe('SubjectTeacherDashboardComponent', () => {
  let component: SubjectTeacherDashboardComponent;
  let fixture: ComponentFixture<SubjectTeacherDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubjectTeacherDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectTeacherDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
