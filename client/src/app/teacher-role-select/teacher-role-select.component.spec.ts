import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherRoleSelectComponent } from './teacher-role-select.component';

describe('TeacherRoleSelectComponent', () => {
  let component: TeacherRoleSelectComponent;
  let fixture: ComponentFixture<TeacherRoleSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeacherRoleSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherRoleSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
