import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js/auto';
import { ApiService } from '../services/api.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

Chart.register(...registerables);

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class StudentDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  profile: any = null;
  attendance: any;
  allHomeworks: any[] = [];
  allMarks: any[] = [];
  allExams: any[] = [];
  examTypes: string[] = ['All', 'Unit Test 1', 'Unit Test 2', 'Mid Term', 'Unit Test 3', 'Final Exam'];
  selectedExam: string = 'All';
  displayedHomeworks: any[] = [];
  displayedMarks: any[] = [];
  displayedExams: any[] = [];
  displayedTeacherContact: any;
  subjectTeachers: any[] = [];
  classAdvisor: any;
  pastLeaveRequests: any[] = [];
  isLeaveModalOpen = false;
  isProfileModalOpen = false;
  attendanceChart: any;
  gradesChart: any;
  averageGrade = 0;
  schoolNews = 'Our vision is to foster a learning environment where every student can achieve their full potential. *** Upcoming: Parent-Teacher meetings next Tuesday. ***';

  leaveRequest = {
    reason: '',
    startDate: '',
    endDate: '',
    details: '',
  };

  // Assignment Details Modal
  selectedAssignment: any = null;

  showAssignmentDetails(assignment: any) {
    this.selectedAssignment = assignment;
  }

  closeAssignmentDetails() {
    this.selectedAssignment = null;
  }

  // Resources
  allResources: any[] = [];
  displayedResources: any[] = [];
  subjects: string[] = ['All'];  // Will be populated from student's class subjects
  selectedSubjectForResources: string = 'All';

  private destroy$ = new Subject<void>();
  private refreshInterval = 10000; // ✅ REAL-TIME: Refresh every 10 seconds

  constructor(private api: ApiService) { }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) return;

    // Load profile and basic data
    this.api.getStudentProfile(user.id).subscribe({
      next: (res) => {
        this.profile = {
          name: res.name,
          class: res.className,
          division: res.division,
          rollNo: res.id,
        };

        // Load assignments for this student's class
        if (res.className && res.division) {
          this.loadAssignments(res.className, res.division);
          this.loadResources(res.className, res.division);
          this.loadClassAdvisor(res.className, res.division);
        }
      },
      error: (err) => console.error('❌ Profile API Error:', err),
    });

    // Load attendance
    this.loadAttendance(user.id);

    // Load marks
    this.loadMarks(user.id);

    // Load leave requests with real-time polling
    this.loadLeaveHistory(user.id);

    this.loadStudentEvents(user.id);

    // Initialize subject teachers (Mock for now, can be updated later)
    this.subjectTeachers = [
      { subject: 'Math', title: 'Math Teacher', name: 'Mr. Rajesh Kumar', email: 'rajesh.k@school.edu', mobile: '9876543211' },
      { subject: 'Science', title: 'Science Teacher', name: 'Ms. Priya Singh', email: 'priya.s@school.edu', mobile: '9876543212' },
      { subject: 'History', title: 'History Teacher', name: 'Mr. David Lee', email: 'david.l@school.edu', mobile: '9876543213' },
      { subject: 'English', title: 'English Teacher', name: 'Ms. Emily White', email: 'emily.w@school.edu', mobile: '9876543214' }
    ];

    this.filterDashboard();
    this.calculateAverageGrade();

    // 🔄 REAL-TIME POLLING: Auto-refresh leave requests, events, marks, attendance, and assignments every 10 seconds
    interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('🔄 Real-time sync: Refreshing data...');
        this.loadLeaveHistory(user.id);
        this.loadStudentEvents(user.id);
        this.loadMarks(user.id);
        this.loadAttendance(user.id);
        // Reload assignments if we have class info
        if (this.profile?.class && this.profile?.division) {
          this.loadAssignments(this.profile.class, this.profile.division);
        }
      });
  }

  loadClassAdvisor(className: string, division: string) {
    this.api.getClassByNameAndDivision(className, division).subscribe({
      next: (classData: any) => {
        if (classData && classData.class_teacher) {
          // Fetch teacher details
          this.api.getUserById(classData.class_teacher).subscribe({
            next: (teacher: any) => {
              this.classAdvisor = {
                title: 'Class Advisor',
                name: teacher.name,
                email: teacher.email,
                mobile: teacher.phone || 'N/A'
              };
              // Update display if currently showing advisor (default)
              if (!this.selectedExam || this.selectedExam === 'All') {
                this.displayedTeacherContact = this.classAdvisor;
              }
              console.log('✅ Class Advisor loaded:', this.classAdvisor);
            },
            error: (err) => {
              console.error('❌ Error loading teacher details:', err);
              this.setClassAdvisorNotAssigned();
            }
          });
        } else {
          this.setClassAdvisorNotAssigned();
        }
      },
      error: (err) => {
        console.error('❌ Error loading class details:', err);
        this.setClassAdvisorNotAssigned();
      }
    });
  }

  private setClassAdvisorNotAssigned() {
    this.classAdvisor = {
      title: 'Class Advisor',
      name: 'Not Assigned',
      email: 'N/A',
      mobile: 'N/A'
    };
    this.displayedTeacherContact = this.classAdvisor;
  }
  loadAttendance(studentId: number) {
    this.api.getAttendanceByStudent(studentId).subscribe({
      next: (res: any) => {
        // Handle array response
        const attendanceRecords = Array.isArray(res) ? res : [];

        // Calculate statistics
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter((a: any) => a.status === 'Present').length;
        const absentDays = attendanceRecords.filter((a: any) => a.status === 'Absent').length;

        // Update attendance object for the pie chart
        this.attendance = {
          present: presentDays,
          absent: absentDays
        };

        // Recreate the attendance chart with real data
        if (totalDays > 0) {
          this.createAttendanceChart();
        }

        console.log('✅ Attendance loaded:', { totalDays, presentDays, absentDays });
      },
      error: (err) => {
        console.error('❌ Attendance load error:', err);
        // Keep default mock data if API fails
      }
    });
  }

  loadMarks(studentId: number) {
    this.api.getMarksByStudent(studentId).subscribe({
      next: (res: any) => {
        // Handle paginated response or array
        const marks = Array.isArray(res) ? res : (res.results || []);

        this.allMarks = marks.map((m: any) => ({
          subject: m.subject,
          score: m.marks_obtained,
          examType: m.exam_type,
          total: m.total_marks,
          percentage: m.percentage
        }));

        console.log('✅ Marks loaded:', this.allMarks);
        this.filterDashboard();
      },
      error: (err) => console.error('❌ Marks load error:', err)
    });
  }

  loadLeaveHistory(studentId: number) {
    this.api.getLeaveHistory(studentId).subscribe({
      next: (res) => {
        this.pastLeaveRequests = Array.isArray(res) ? res : (res?.results || []);
        console.log('✅ Leave requests updated:', this.pastLeaveRequests);
      },
      error: (err) => console.error('❌ Leave load error', err),
    });
  }

  private loadStudentEvents(studentId: number) {
    // Load all events that are for 'ALL' audience (public events)
    this.api.getAllEvents().subscribe({
      next: (events) => {
        // Filter for public events or events specific to the student's class
        if (Array.isArray(events)) {
          this.allExams = events.map((e: any) => ({
            subject: 'Event',
            title: e.title,
            date: e.date,
            description: e.description || '',
            audience: e.audience
          }));
        } else {
          this.allExams = [];
        }
        console.log('✅ Events loaded:', this.allExams);
        this.filterDashboard();
      },
      error: (err) => {
        console.error("❌ Events load error:", err);
        this.allExams = [];
      }
    });
  }

  loadAssignments(className: string, division: string) {
    this.api.getAssignmentsByClass(className, division).subscribe({
      next: (response: any) => {
        const assignments = Array.isArray(response) ? response : (response.results || []);
        this.allHomeworks = assignments.map((assignment: any) => ({
          id: assignment.id,
          title: assignment.title,
          subject: assignment.subject,
          dueDate: assignment.due_date,
          description: assignment.description || ''
        }));
        console.log('✅ Assignments loaded:', this.allHomeworks.length);
        this.filterDashboard(); // Update displayed assignments
      },
      error: (err) => {
        console.error('❌ Error loading assignments:', err);
        this.allHomeworks = [];
      }
    });
  }

  ngAfterViewInit() {
    this.createAttendanceChart();
    // Don't create grades chart here - it will be created after data loads in filterDashboard()
  }

  filterDashboard() {
    this.displayedHomeworks = this.allHomeworks;

    // Filter marks by Exam Type only
    this.displayedMarks = this.allMarks.filter((m) => {
      const examMatch = this.selectedExam === 'All' || m.examType === this.selectedExam;
      return examMatch;
    });

    this.displayedExams = [...this.allExams];
    // Always show Class Advisor since subject filter is removed
    this.displayedTeacherContact = this.classAdvisor;

    this.calculateAverageGrade();

    // Always recreate chart with filtered data
    this.createGradesChart(this.displayedMarks);
  }

  submitLeaveRequest() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id) return;

    // Validate form
    if (!this.leaveRequest.reason || !this.leaveRequest.startDate || !this.leaveRequest.endDate) {
      alert('❌ Please fill in all required fields');
      return;
    }

    // Format the leave request payload
    const leavePayload = {
      student: user.id,
      reason: this.leaveRequest.reason,
      start_date: this.leaveRequest.startDate,
      end_date: this.leaveRequest.endDate,
      details: this.leaveRequest.details,
      status: 'Pending'
    };

    this.api.createLeave(leavePayload).subscribe({
      next: (response) => {
        alert('✅ Leave request submitted successfully');
        this.loadLeaveHistory(user.id);
        this.closeLeaveModal();
        this.leaveRequest = { reason: '', startDate: '', endDate: '', details: '' };
      },
      error: (err) => {
        console.error('❌ Error submitting leave:', err);
        alert('❌ Error submitting leave request. Please try again.');
      }
    });
  }

  openLeaveModal() { this.isLeaveModalOpen = true; }
  closeLeaveModal() { this.isLeaveModalOpen = false; }
  toggleProfileModal() { this.isProfileModalOpen = !this.isProfileModalOpen; }

  logout() {
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  calculateAverageGrade() {
    if (!this.displayedMarks.length) return;
    const sum = this.displayedMarks.reduce((a, b) => a + b.score, 0);
    this.averageGrade = sum / this.displayedMarks.length;
  }

  createAttendanceChart() {
    if (!this.attendance) return;
    const ctx = document.getElementById('attendancePieChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.attendanceChart) this.attendanceChart.destroy();

    this.attendanceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent'],
        datasets: [{
          data: [this.attendance.present, this.attendance.absent],
          backgroundColor: ['#68d3b1', '#fde8e8'],
          borderColor: '#ffffff',
          borderWidth: 4,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  createGradesChart(data: any[]) {
    console.log('📊 Creating grades chart with data:', data);

    if (!data || data.length === 0) {
      console.warn('⚠️ No data available for chart');
      return;
    }

    const ctx = document.getElementById('gradesBarChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('❌ Chart canvas element not found');
      return;
    }

    if (this.gradesChart) this.gradesChart.destroy();

    // Generate dynamic colors for each subject
    const generateColor = (index: number) => {
      const colors = [
        'rgba(138, 99, 210, 0.7)',   // Purple
        'rgba(104, 211, 177, 0.7)',  // Teal
        'rgba(255, 179, 102, 0.7)',  // Orange
        'rgba(130, 177, 255, 0.7)',  // Blue
        'rgba(255, 107, 129, 0.7)',  // Pink
        'rgba(255, 206, 84, 0.7)',   // Yellow
        'rgba(75, 192, 192, 0.7)',   // Cyan
        'rgba(153, 102, 255, 0.7)',  // Violet
      ];
      return colors[index % colors.length];
    };

    this.gradesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map((m) => m.subject),
        datasets: [{
          label: 'Marks Obtained',
          data: data.map((m) => m.score),
          backgroundColor: data.map((_, index) => generateColor(index)),
          borderColor: data.map((_, index) => generateColor(index).replace('0.7', '1')),
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const mark = data[context.dataIndex];
                return `Score: ${mark.score}/${mark.total || 100} (${mark.percentage?.toFixed(1) || ((mark.score / (mark.total || 100)) * 100).toFixed(1)}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Marks'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Subjects'
            }
          }
        },
      }
    });

    console.log('✅ Chart created successfully');
  }

  loadResources(className: string, division: string) {
    this.api.getResourcesByClass(className, division).subscribe({
      next: (response: any) => {
        const resources = Array.isArray(response) ? response : (response.results || []);
        this.allResources = resources;

        // Extract unique subjects for the filter
        const subjectSet = new Set<string>(['All']);
        resources.forEach((r: any) => {
          if (r.subject) subjectSet.add(r.subject);
        });
        this.subjects = Array.from(subjectSet);

        this.filterResources();
        console.log('✅ Resources loaded:', this.allResources.length);
      },
      error: (err) => {
        console.error('❌ Error loading resources:', err);
        this.allResources = [];
        this.displayedResources = [];
      }
    });
  }

  filterResources() {
    if (this.selectedSubjectForResources === 'All') {
      this.displayedResources = [...this.allResources];
    } else {
      this.displayedResources = this.allResources.filter(
        r => r.subject === this.selectedSubjectForResources
      );
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
