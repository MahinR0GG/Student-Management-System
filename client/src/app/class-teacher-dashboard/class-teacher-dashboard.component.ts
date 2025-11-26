import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';   // ✅ Correct path

@Component({
  selector: 'app-class-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './class-teacher-dashboard.component.html',
  styleUrls: ['./class-teacher-dashboard.component.css'],
})
export class ClassTeacherDashboardComponent implements OnInit {

  constructor(
    private router: Router,
    private api: ApiService   // ✅ Works now
  ) { }

  ngOnInit() {
    this.loadTeacherInfo();
  }

  // ====================================
  // PAGE STATE
  // ====================================
  currentView: string = 'overview';
  setView(view: string) { this.currentView = view; }

  // ====================================
  // TEACHER INFO
  // ====================================
  teacherId!: number;
  teacherName: string = '';
  classId!: number;
  className: string = '';
  teacherProfile: any = {};

  isClassTeacher: boolean = false;
  classInfo: any = null;

  loadTeacherInfo() {
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');

    if (!user || !user.id) {
      console.error('User not found in storage');
      this.router.navigate(['/login']);
      return;
    }

    this.teacherId = user.id;
    this.teacherName = user.name;

    // Fetch complete dashboard data from backend
    this.api.getClassTeacherDashboard(this.teacherId).subscribe({
      next: (dashboardData: any) => {
        console.log('Dashboard data received:', dashboardData);

        if (!dashboardData.class) {
          console.error('No class found for this teacher');
          this.isClassTeacher = false;
          alert('You are not assigned as a class teacher');
          this.router.navigate(['/teacher/role-select']);
          return;
        }

        this.isClassTeacher = true;

        // Class Information
        this.classInfo = dashboardData.class;
        this.classId = dashboardData.class.id;
        this.className = `${dashboardData.class.class_number}${dashboardData.class.division}`;
        this.teacherProfile = {
          name: dashboardData.teacher.name,
          email: dashboardData.teacher.email,
          role: dashboardData.teacher.role
        };

        // Students
        this.students = dashboardData.students || [];
        this.totalStudents = dashboardData.total_students || 0;

        // Attendance - calculate absent today
        this.presentToday = dashboardData.present_today || 0;
        this.absentToday = this.totalStudents - this.presentToday;

        // Leave Requests
        this.leaveRequests = dashboardData.pending_leaves || [];

        // Events
        this.events = dashboardData.events || [];

        // Subjects
        this.subjectsData = dashboardData.subjects || [];
        if (dashboardData.subjects && dashboardData.subjects.length > 0) {
          this.subjectList = ['All Subjects', ...dashboardData.subjects.map((s: any) => s.name)];
        }

        // Initialize filtered subjects for academic view
        this.updateFilteredSubjects();

        // Load marks for this class
        this.loadMarksForClass();

        console.log('Dashboard loaded successfully');
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        if (err.status === 404) {
          alert('You are not assigned as a class teacher');
          this.router.navigate(['/teacher/role-select']);
        } else {
          alert('Error loading dashboard: ' + (err.error?.detail || err.message || 'Unknown error'));
        }
        this.isClassTeacher = false;
      }
    });
  }

  // ====================================
  // STUDENTS
  // ====================================
  students: any[] = [];
  totalStudents: number = 0;
  editingStudent: any = null;
  searchTerm = '';
  sortColumn = 'rollNo';
  sortOrder: 'asc' | 'desc' = 'asc';

  // No separate loadStudents() needed - data comes from dashboard endpoint

  get filteredStudents() {
    let filtered = this.students.filter(s =>
      s.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Sort the filtered students
    filtered.sort((a, b) => {
      let aVal = a[this.sortColumn];
      let bVal = b[this.sortColumn];

      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
  }

  startEdit(student: any) {
    this.editingStudent = { ...student };
  }

  saveStudentEdit() {
    if (!this.editingStudent) return;

    const updateData = {
      name: this.editingStudent.name,
      email: this.editingStudent.email,  // Include email (required by serializer)
      role: this.editingStudent.role,    // Include role (required by serializer)
      className: this.editingStudent.className,
      division: this.editingStudent.division,
    };

    this.api.updateUser(this.editingStudent.id, updateData).subscribe({
      next: () => {
        // Update the local students array
        const index = this.students.findIndex(s => s.id === this.editingStudent.id);
        if (index !== -1) {
          this.students[index] = this.editingStudent;
        }
        alert('Student details updated successfully!');
        this.editingStudent = null;
      },
      error: (err) => {
        console.error('Error updating student:', err);
        alert('Error updating student: ' + (err.error?.detail || JSON.stringify(err.error) || err.message));
      }
    });
  }

  cancelEdit() {
    this.editingStudent = null;
  }

  // ====================================
  // ATTENDANCE
  // ====================================
  selectedDate: string = new Date().toISOString().split('T')[0];
  presentToday: number = 0;
  absentToday: number = 0;
  attendanceDateForDisplay: string = new Date().toISOString().split('T')[0];

  // Attendance data is loaded from dashboard endpoint
  // No separate loadAttendance() needed

  markAllPresent() {
    this.students.forEach(s => s.present = true);
  }

  markAllAbsent() {
    this.students.forEach(s => s.present = false);
  }

  saveAttendance() {
    const data = {
      classId: this.classId,
      teacherId: this.teacherId,  // Add teacher ID
      date: this.selectedDate,
      records: this.students.map(s => ({
        studentId: s.id,
        present: s.present,
      })),
    };

    console.log('Sending attendance data:', data);
    this.api.markAttendance(data).subscribe({
      next: (response: any) => {
        console.log('Attendance saved response:', response);
        // Update attendance counts immediately
        this.presentToday = this.students.filter(s => s.present).length;
        this.absentToday = this.totalStudents - this.presentToday;
        this.attendanceDateForDisplay = this.selectedDate;
        alert('Attendance saved successfully!');
        // Reload dashboard to get fresh stats from server
        this.loadTeacherInfo();
      },
      error: (err) => {
        console.error('Error saving attendance:', err);
        const errorMessage = err.error?.detail || JSON.stringify(err.error) || err.message || 'Unknown error';
        alert('Error saving attendance: ' + errorMessage);
      }
    });
  }

  // ====================================
  // LEAVE REQUESTS
  // ====================================
  leaveRequests: any[] = [];

  // Leave requests data is loaded from dashboard endpoint
  // No separate loadLeaveRequests() needed

  get pendingLeaves() {
    return this.leaveRequests.filter(l => l.status === 'Pending').length;
  }

  approveLeave(leave: any) {
    this.api.approveLeave(leave.id).subscribe(() => {
      leave.status = 'Approved';
    });
  }

  rejectLeave(leave: any) {
    this.api.rejectLeave(leave.id).subscribe(() => {
      leave.status = 'Rejected';
    });
  }

  // ====================================
  // EVENTS
  // ====================================
  events: any[] = [];
  newEvent = { title: '', date: '', description: '' };

  // Events data is loaded from dashboard endpoint
  // No separate loadEvents() needed

  addEvent() {
    if (!this.newEvent.title || !this.newEvent.date) return;

    const data = {
      classId: this.classId,
      ...this.newEvent,
    };

    this.api.createEvent(data).subscribe((res: any) => {
      this.events.push(res);
      this.newEvent = { title: '', date: '', description: '' };
    });
  }

  deleteEvent(i: number) {
    const id = this.events[i].id;
    this.api.deleteEvent(id).subscribe(() => {
      this.events.splice(i, 1);
    });
  }

  // ====================================
  // SUBJECTS + EXAMS + MARKS
  // ====================================
  subjectList: string[] = ['All Subjects'];
  studentsMarks: any[] = [];
  subjectsData: any[] = [];
  marksData: any[] = [];
  selectedSubjectView: string = 'All Subjects';
  selectedExamView: string = 'Final Exam';
  examTypes: string[] = ['Unit Test 1', 'Unit Test 2', 'Mid Term', 'Unit Test 3', 'Final Exam'];
  subjectFilter: string = 'All';
  filteredSubjects: any[] = [];

  loadMarksForClass() {
    if (!this.classId) return;

    this.api.getMarksByClass(this.classId).subscribe({
      next: (response: any) => {
        console.log('Marks data received:', response);
        this.marksData = response.marks || [];
        this.processMarksData();
      },
      error: (err) => {
        console.error('Error loading marks:', err);
        this.marksData = [];
      }
    });
  }

  processMarksData() {
    // Group marks by student
    const marksMap = new Map();

    this.marksData.forEach((mark: any) => {
      if (!marksMap.has(mark.student)) {
        const student = this.students.find(s => s.id === mark.student);
        marksMap.set(mark.student, {
          studentId: mark.student,
          studentName: mark.student_name || student?.name || 'Unknown',
          rollNo: student?.id || '',
          marks: []
        });
      }
      marksMap.get(mark.student).marks.push(mark);
    });

    this.studentsMarks = Array.from(marksMap.values());
  }

  get filteredMarksData() {
    let filtered = this.marksData;

    if (this.selectedSubjectView !== 'All Subjects') {
      filtered = filtered.filter(m => m.subject_name === this.selectedSubjectView);
    }

    if (this.selectedExamView !== 'All Exams') {
      filtered = filtered.filter(m => m.exam_type === this.selectedExamView);
    }

    return filtered;
  }

  updateFilteredSubjects() {
    if (this.subjectFilter === 'All') {
      this.filteredSubjects = this.subjectsData;
    } else {
      this.filteredSubjects = this.subjectsData.filter(s => s.name === this.subjectFilter);
    }
  }

  // ====================================
  // LOGOUT
  // ====================================
  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
