import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subject-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-teacher-dashboard.component.html',
  styleUrls: ['./subject-teacher-dashboard.component.css']
})
export class SubjectTeacherDashboardComponent {

  constructor(private router: Router) {}

  /* ✅ Top Right Logout */
  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  /* ✅ View Control */
  currentView = 'overview';
  setView(view: string) { this.currentView = view; }

  /* ✅ Class Switching */
  classList = ['9A', '9B', '9C', '10A', '10B'];
  currentClass = '9B';

  switchClass(cls: string) {
    this.currentClass = cls;
    // later you can add API call here to fetch class data
  }

  /* Teacher Info */
  teacherName = 'Ms. Reshmi';
  subjectName = 'Mathematics';

  /* KPI */
  totalStudents = 40;
  pendingAssignments = 3;
  averageMarks = 82;

  /* Exam Dropdown */
  examTypes = ['Class Test', 'Mid Term', 'Onam Exam', 'Final Exam'];
  selectedExam = 'Class Test';
  isDropdownOpen = false;

  toggleDropdown() { this.isDropdownOpen = !this.isDropdownOpen; }
  selectExam(exam: string) {
    this.selectedExam = exam;
    this.isDropdownOpen = false;
  }

  /* Students Marks */
  students = [
    { rollNo: 1, name: 'Aarav', assignmentMarks: 18, examMarks: 85 },
    { rollNo: 2, name: 'Diya', assignmentMarks: 20, examMarks: 78 },
    { rollNo: 3, name: 'Rahul', assignmentMarks: 17, examMarks: 91 }
  ];

  updateMarks(student: any) {
    alert(`✅ Marks updated for ${student.name}`);
  }

  /* Assignments */
  newAssignment: any = { title: '', dueDate: '', description: '' };
  assignments: any[] = [
    { title: 'Worksheet 1', dueDate: '2025-10-25', description: 'Algebra practice', status: 'Pending' },
    { title: 'Chapter Test', dueDate: '2025-11-05', description: 'Polynomials', status: 'Assigned' }
  ];

  addAssignment() {
    if (!this.newAssignment.title) return;
    this.assignments.push({ ...this.newAssignment, status: 'Pending' });
    this.newAssignment = { title: '', dueDate: '', description: '' };
  }

  editAssignment(a: any) {
    alert('✏️ Assignment editing coming soon!');
  }

  deleteAssignment(a: any) {
    this.assignments = this.assignments.filter(x => x !== a);
  }

  /* Resources */
  newResource: any = { title: '', link: '' };
  resources = [
    { title: 'Chapter Notes', link: 'https://example.com/notes' },
    { title: 'Video Lesson', link: 'https://youtu.be/sample' }
  ];

  addResource() {
    if (!this.newResource.title || !this.newResource.link) return;
    this.resources.push({ ...this.newResource });
    this.newResource = { title: '', link: '' };
  }
}
