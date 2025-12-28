import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-subject-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-teacher-dashboard.component.html',
  styleUrls: ['./subject-teacher-dashboard.component.css']
})
export class SubjectTeacherDashboardComponent implements OnInit {

  constructor(
    private router: Router,
    private apiService: ApiService
  ) { }

  isLoading = false;
  errorMessage = '';
  teacherId: number | null = null;

  /* Teacher Info */
  teacherName = '';
  subjectName = '';
  teacherProfile: any = {};

  /* Class Switching */
  classList: any[] = [];
  currentClass: any = null;
  currentClassId: number | null = null;

  /* KPI */
  totalStudents = 0;
  pendingAssignments = 0;
  averageMarks = 0;

  /* Exam Dropdown */
  examTypes = ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Unit Test 3', 'Final Exam'];
  selectedExam = 'Unit Test 1';
  isDropdownOpen = false;

  /* Students Marks */
  students: any[] = [];

  /* Assignments */
  newAssignment: any = { title: '', dueDate: '', description: '' };
  assignments: any[] = [];

  /* Resources */
  newResource: any = { title: '', link: '' };
  resources: any[] = [];

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.teacherId = user.id;
      this.teacherName = user.name;
      this.loadDashboardData();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadDashboardData(classId?: number) {
    if (!this.teacherId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getSubjectTeacherDashboard(this.teacherId, classId).subscribe({
      next: (data) => {
        this.teacherProfile = data.teacher;
        this.teacherName = data.teacher.name;
        this.classList = data.classes;

        if (data.current_class) {
          this.currentClass = data.current_class;
          this.currentClassId = data.current_class.id;
          this.subjectName = data.current_class.subject;

          // Map students and merge with marks
          this.processStudentsAndMarks(data.students, data.marks);

          // Load assignments for this class
          this.loadAssignments();

          // Load resources for this class
          this.loadResources();
        } else {
          this.currentClass = null;
          this.students = [];
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.errorMessage = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  processStudentsAndMarks(students: any[], marks: any[]) {
    this.students = students.map(student => {
      // Find marks for this student and current exam
      const studentMark = marks.find(m =>
        m.student === student.id &&
        m.exam_type === this.selectedExam
      );

      return {
        id: student.id,
        rollNo: student.id, // Using ID as roll no for now
        name: student.name,
        email: student.email,
        examMarks: studentMark ? studentMark.marks_obtained : null,
        markId: studentMark ? studentMark.id : null,
        assignmentMarks: 0 // Placeholder as we don't have assignment marks in DB yet
      };
    });

    this.totalStudents = this.students.length;

    // Calculate average
    const marksList = this.students
      .filter(s => s.examMarks !== null)
      .map(s => s.examMarks);

    if (marksList.length > 0) {
      this.averageMarks = Math.round(marksList.reduce((a, b) => a + b, 0) / marksList.length);
    } else {
      this.averageMarks = 0;
    }
  }

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
  switchClass(classId: any) {
    // Handle both object (from ngValue) and string/number (from value)
    const id = typeof classId === 'object' ? classId.id : classId;
    this.loadDashboardData(id);
  }

  toggleDropdown() { this.isDropdownOpen = !this.isDropdownOpen; }

  selectExam(exam: string) {
    this.selectedExam = exam;
    this.isDropdownOpen = false;
    // Reload data to refresh marks for selected exam
    if (this.currentClassId) {
      this.loadDashboardData(this.currentClassId);
    }
  }

  updateMarks(student: any) {
    if (student.examMarks === null || student.examMarks === undefined) return;

    const marksData = {
      student: student.id,
      teacher: this.teacherId,
      subject: this.subjectName,
      class_name: this.currentClass.class_number,
      division: this.currentClass.division,
      exam_type: this.selectedExam,
      marks_obtained: student.examMarks,
      total_marks: 100
    };

    if (student.markId) {
      // Update existing mark
      this.apiService.updateMarks(student.markId, marksData).subscribe({
        next: (res) => {
          alert(`✅ Marks updated for ${student.name}`);
        },
        error: (err) => {
          console.error('Error updating marks:', err);
          alert('❌ Failed to update marks');
        }
      });
    } else {
      // Create new mark
      this.apiService.createMarks(marksData).subscribe({
        next: (res) => {
          student.markId = res.id; // Save the new mark ID
          alert(`✅ Marks saved for ${student.name}`);
        },
        error: (err) => {
          console.error('Error saving marks:', err);
          alert('❌ Failed to save marks');
        }
      });
    }
  }

  /* Assignments - Save to backend */
  addAssignment() {
    if (!this.newAssignment.title || !this.newAssignment.dueDate) {
      alert('❌ Please fill in title and due date');
      return;
    }

    if (!this.currentClass) {
      alert('❌ Please select a class first');
      return;
    }

    const assignmentData = {
      teacher: this.teacherId,
      subject: this.subjectName,
      class_name: this.currentClass.class_number.toString(),
      division: this.currentClass.division,
      title: this.newAssignment.title,
      description: this.newAssignment.description || '',
      due_date: this.newAssignment.dueDate
    };

    this.apiService.createAssignment(assignmentData).subscribe({
      next: (res) => {
        alert(`✅ Assignment "${this.newAssignment.title}" created successfully!`);
        this.assignments.push(res);
        this.newAssignment = { title: '', dueDate: '', description: '' };
        this.loadAssignments(); // Reload to get fresh data
      },
      error: (err) => {
        console.error('Error creating assignment:', err);
        alert('❌ Failed to create assignment. Please try again.');
      }
    });
  }

  loadAssignments() {
    if (!this.currentClass) return;

    const className = this.currentClass.class_number.toString();
    const division = this.currentClass.division;

    this.apiService.getAssignmentsByClass(className, division).subscribe({
      next: (response: any) => {
        this.assignments = Array.isArray(response) ? response : (response.results || []);
        console.log('✅ Assignments loaded:', this.assignments.length);
      },
      error: (err) => {
        console.error('❌ Error loading assignments:', err);
        this.assignments = [];
      }
    });
  }

  editAssignment(a: any) {
    alert('✏️ Assignment editing coming soon!');
  }

  deleteAssignment(a: any) {
    if (!confirm(`Delete assignment "${a.title}"?`)) return;

    this.apiService.deleteAssignment(a.id).subscribe({
      next: () => {
        this.assignments = this.assignments.filter(x => x.id !== a.id);
        alert('✅ Assignment deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting assignment:', err);
        alert('❌ Failed to delete assignment');
      }
    });
  }


  /* Resources - Save to backend */
  addResource() {
    if (!this.newResource.title || !this.newResource.link) {
      alert('❌ Please fill in title and link');
      return;
    }

    if (!this.currentClass) {
      alert('❌ Please select a class first');
      return;
    }

    const resourceData = {
      teacher: this.teacherId,
      subject: this.subjectName,
      class_name: this.currentClass.class_number.toString(),
      division: this.currentClass.division,
      title: this.newResource.title,
      link: this.newResource.link
    };

    this.apiService.createResource(resourceData).subscribe({
      next: (res) => {
        alert(`✅ Resource "${this.newResource.title}" added successfully!`);
        this.resources.push(res);
        this.newResource = { title: '', link: '' };
        this.loadResources(); // Reload to get fresh data
      },
      error: (err) => {
        console.error('Error creating resource:', err);
        alert('❌ Failed to add resource. Please try again.');
      }
    });
  }

  loadResources() {
    if (!this.currentClass || !this.teacherId) return;

    const className = this.currentClass.class_number.toString();
    const division = this.currentClass.division;

    this.apiService.getResourcesByTeacher(this.teacherId, className, division).subscribe({
      next: (response: any) => {
        this.resources = Array.isArray(response) ? response : (response.results || []);
        console.log('✅ Resources loaded:', this.resources.length);
      },
      error: (err) => {
        console.error('❌ Error loading resources:', err);
        this.resources = [];
      }
    });
  }

  deleteResource(r: any) {
    if (!confirm(`Delete resource "${r.title}"?`)) return;

    this.apiService.deleteResource(r.id).subscribe({
      next: () => {
        this.resources = this.resources.filter(x => x.id !== r.id);
        alert('✅ Resource deleted successfully');
      },
      error: (err) => {
        console.error('Error deleting resource:', err);
        alert('❌ Failed to delete resource');
      }
    });
  }
}
