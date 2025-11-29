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
    private api: ApiService
  ) { }

  ngOnInit() {
    this.loadTeacherInfo();
    this.loadAllClasses();
  }

  // Teacher Info
  teacherId: number = 0;
  teacherName: string = '';
  teacherSubject: string = '';
  teacherEmail: string = '';

  // View Control
  currentView = 'overview';
  setView(view: string) {
    this.currentView = view;
  }

  // Classes and Students
  classList: any[] = [];
  selectedClassForMarks: any = null;
  studentsForMarks: any[] = [];
  loadingStudents: boolean = false;

  // KPIs
  totalClasses: number = 0;
  totalAssignments: number = 0;
  pendingAssignments: number = 0;

  // Exam Types
  examTypes = ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Unit Test 3', 'Final Exam'];
  selectedExamType = 'Unit Test 1';

  // Marks Entry
  marksEntry: any = {
    examType: 'Unit Test 1',
    totalMarks: 100
  };

  // Assignments
  newAssignment: any = {
    title: '',
    description: '',
    dueDate: '',
    className: '',
    division: '',
    classSelection: ''
  };
  assignments: any[] = [];

  // Resources (keeping for UI compatibility)
  newResource: any = { title: '', link: '' };
  resources: any[] = [];

  /* ========================================
     LOAD TEACHER INFO & DASHBOARD DATA
  ======================================== */
  loadTeacherInfo() {
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

    if (!user || !user.id) {
      console.error('User not found in storage');
      this.router.navigate(['/login']);
      return;
    }

    this.teacherId = user.id;
    this.teacherName = user.name;
    this.teacherSubject = user.subject || 'Subject';
    this.teacherEmail = user.email;

    this.loadAssignments();
  }

  loadAllClasses() {
    this.api.getAllClasses().subscribe({
      next: (response: any) => {
        console.log('Classes API response:', response);
        // Handle paginated response
        if (Array.isArray(response)) {
          this.classList = response;
        } else if (response && response.results) {
          this.classList = response.results;
        } else {
          this.classList = [];
        }
        this.totalClasses = this.classList.length;
        console.log('Classes loaded:', this.totalClasses);
      },
      error: (err) => {
        console.error('Error loading classes:', err);
      }
    });
  }

  /* ========================================
     MARKS ENTRY
  ======================================== */
  onClassSelectionChange() {
    console.log('Class selection changed:', this.selectedClassForMarks);
    if (this.selectedClassForMarks) {
      this.loadStudentsForMarks();
    }
  }

  loadStudentsForMarks() {
    if (!this.selectedClassForMarks) return;

    this.loadingStudents = true;
    const classNumber = this.selectedClassForMarks.class_number;
    const division = this.selectedClassForMarks.division;
    console.log(`Loading students for class ${classNumber}${division}`);

    this.api.getUsersByClass(classNumber, division).subscribe({
      next: (response: any) => {
        this.studentsForMarks = (response.users || []).map((student: any) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          marksObtained: 0,
          remarks: ''
        }));
        this.loadingStudents = false;
      },
      error: (err) => {
        console.error('Error loading students:', err);
        this.loadingStudents = false;
      }
    });
  }

  saveMarksForClass() {
    if (!this.selectedClassForMarks || !this.teacherSubject) {
      alert('Please select a class');
      return;
    }

    this.api.getAllSubjects().subscribe({
      next: (response: any) => {
        const subjects = Array.isArray(response) ? response : (response.results || []);
        let teacherSubjectObj = subjects.find((s: any) =>
          s.name.toLowerCase() === this.teacherSubject.toLowerCase() &&
          s.class_name === this.selectedClassForMarks.class_number.toString()
        );

        // If subject doesn't exist for this class, create it automatically
        if (!teacherSubjectObj) {
          console.log(`Subject "${this.teacherSubject}" not found for class ${this.selectedClassForMarks.class_number}, creating it...`);

          const newSubjectData = {
            name: this.teacherSubject,
            class_name: this.selectedClassForMarks.class_number.toString(),
            class_teacher: this.teacherId
          };

          this.api.createSubject(newSubjectData).subscribe({
            next: (createdSubject: any) => {
              console.log('Subject created successfully:', createdSubject);
              // Now proceed with saving marks using the newly created subject
              this.saveMarksWithSubject(createdSubject);
            },
            error: (err) => {
              console.error('Error creating subject:', err);
              alert('Error creating subject. Please try again.');
            }
          });
        } else {
          // Subject exists, proceed with saving marks
          this.saveMarksWithSubject(teacherSubjectObj);
        }
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        alert('Error loading subjects. Please try again.');
      }
    });
  }

  // Helper method to save marks once we have a valid subject
  private saveMarksWithSubject(subjectObj: any) {
    const marksPromises = this.studentsForMarks.map(student => {
      const markData = {
        student: student.id,
        subject: subjectObj.name,  // Send subject NAME as string, not ID
        exam_type: this.selectedExamType,
        marks_obtained: student.marksObtained || 0,
        total_marks: this.marksEntry.totalMarks,
        remarks: student.remarks || '',
        class_name: this.selectedClassForMarks.class_number.toString(),
        division: this.selectedClassForMarks.division,
        teacher: this.teacherId  // Changed from created_by to teacher
      };
      return this.api.createMarks(markData).toPromise();
    });

    Promise.all(marksPromises)
      .then(() => {
        alert('✅ Marks saved successfully!');
        this.studentsForMarks.forEach(s => {
          s.marksObtained = 0;
          s.remarks = '';
        });
      })
      .catch((err) => {
        console.error('Error saving marks:', err);
        console.error('Error details:', err.error);
        console.error('Error message:', err.message);
        alert('Error saving marks: ' + (err.error?.detail || err.error?.non_field_errors?.[0] || err.message || 'Unknown error'));
      });
  }

  /* ========================================
     ASSIGNMENTS
  ======================================== */
  loadAssignments() {
    this.api.getAssignmentsByTeacher(this.teacherId).subscribe({
      next: (response: any) => {
        // Handle paginated response
        if (Array.isArray(response)) {
          this.assignments = response;
        } else if (response && response.results) {
          this.assignments = response.results;
        } else {
          this.assignments = [];
        }
        this.totalAssignments = this.assignments.length;
        this.pendingAssignments = this.assignments.filter((a: any) => a.status === 'Pending').length;
      },
      error: (err) => {
        console.error('Error loading assignments:', err);
      }
    });
  }

  addAssignment() {
    if (!this.newAssignment.title || !this.newAssignment.dueDate) {
      alert('Please fill in title and due date');
      return;
    }

    if (!this.newAssignment.className || !this.newAssignment.division) {
      alert('Please select a class');
      return;
    }

    this.api.getAllSubjects().subscribe({
      next: (response: any) => {
        const subjects = Array.isArray(response) ? response : (response.results || []);
        let teacherSubjectObj = subjects.find((s: any) =>
          s.name.toLowerCase() === this.teacherSubject.toLowerCase() &&
          s.class_name === this.newAssignment.className
        );

        // If subject doesn't exist for this class, create it automatically
        if (!teacherSubjectObj) {
          console.log(`Subject "${this.teacherSubject}" not found for class ${this.newAssignment.className}, creating it...`);

          const newSubjectData = {
            name: this.teacherSubject,
            class_name: this.newAssignment.className,
            class_teacher: this.teacherId
          };

          this.api.createSubject(newSubjectData).subscribe({
            next: (createdSubject: any) => {
              console.log('Subject created successfully:', createdSubject);
              // Now proceed with creating assignment using the newly created subject
              this.createAssignmentWithSubject(createdSubject);
            },
            error: (err) => {
              console.error('Error creating subject:', err);
              alert('Error creating subject. Please try again.');
            }
          });
        } else {
          // Subject exists, proceed with creating assignment
          this.createAssignmentWithSubject(teacherSubjectObj);
        }
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        alert('Error loading subjects. Please try again.');
      }
    });
  }

  // Helper method to create assignment once we have a valid subject
  private createAssignmentWithSubject(subjectObj: any) {
    const assignmentData = {
      title: this.newAssignment.title,
      description: this.newAssignment.description,
      due_date: this.newAssignment.dueDate,
      class_name: this.newAssignment.className,
      division: this.newAssignment.division,
      subject: subjectObj.id,
      teacher: this.teacherId,
      status: 'Pending'
    };

    this.api.createAssignment(assignmentData).subscribe({
      next: (response: any) => {
        alert('✅ Assignment created successfully!');
        this.assignments.push(response);
        this.totalAssignments++;
        this.pendingAssignments++;
        this.newAssignment = {
          title: '',
          description: '',
          dueDate: '',
          className: '',
          division: '',
          classSelection: ''
        };
      },
      error: (err) => {
        console.error('Error creating assignment:', err);
        alert('Error creating assignment: ' + (err.error?.detail || err.message || 'Unknown error'));
      }
    });
  }

  deleteAssignment(assignment: any) {
    if (!confirm(`Delete "${assignment.title}"?`)) return;

    this.api.deleteAssignment(assignment.id).subscribe({
      next: () => {
        alert('Assignment deleted');
        this.assignments = this.assignments.filter(a => a.id !== assignment.id);
        this.totalAssignments--;
        if (assignment.status === 'Pending') this.pendingAssignments--;
      },
      error: (err) => {
        console.error('Error deleting assignment:', err);
      }
    });
  }

  onAssignmentClassChange() {
    const selectedClass = this.classList.find(c =>
      `${c.class_number}${c.division}` === this.newAssignment.classSelection
    );

    if (selectedClass) {
      this.newAssignment.className = selectedClass.class_number.toString();
      this.newAssignment.division = selectedClass.division;
    }
  }

  /* ========================================
     RESOURCES (for UI compatibility)
  ======================================== */
  addResource() {
    if (!this.newResource.title || !this.newResource.link) return;
    this.resources.push({ ...this.newResource });
    this.newResource = { title: '', link: '' };
  }

  /* ========================================
     LOGOUT
  ======================================== */
  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
