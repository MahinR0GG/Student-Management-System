import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

type AttendanceRow = {
  id: number;
  date: string;               // ISO date string
  status: 'Present' | 'Absent';
  className: string;
  division: string;
  student?: { id: number; name: string; className?: string; division?: string };
  teacher?: { id: number; name: string };
};

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  attendance: AttendanceRow[] = [];

  search = '';
  classFilter = 'all';
  divisionFilter = 'all';
  statusFilter = 'all';
  dateFrom = '';
  dateTo = '';

  classes: string[] = [];
  divisions: string[] = ['A', 'B', 'C', 'D', 'E'];

  loading = false;
  error: string | null = null;

  // Add/Edit modal
  showModal = false;
  editMode = false;
  currentRecord: any = null;

  // Form for adding/editing
  attendanceForm = {
    studentId: null as number | null,
    date: '',
    status: 'Present' as 'Present' | 'Absent',
    className: '',
    division: ''
  };

  students: any[] = [];
  allClasses: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.fetchAttendance();
    this.loadStudents();
    this.loadClasses();
  }

  fetchAttendance() {
    this.loading = true;
    this.error = null;

    this.api.getAllAttendance().subscribe({
      next: (res) => {
        console.log("✅ Attendance API:", res);

        // ✅ Handle both response formats (including paginated)
        if (res.attendance) {
          this.attendance = res.attendance;
        } else if (res.data) {
          this.attendance = res.data;
        } else if (res.results) {
          // Django REST framework pagination format
          this.attendance = res.results;
        } else if (Array.isArray(res)) {
          this.attendance = res;
        } else {
          this.attendance = [];
        }

        console.log('Attendance records loaded:', this.attendance.length);

        // ✅ Build class dropdown list
        const classSet = new Set<string>();
        this.attendance.forEach(r => {
          classSet.add(r.className || r.student?.className || '');
        });

        this.classes = Array.from(classSet).filter(c => c !== '').sort();
      },
      error: (err) => {
        console.error('❌ Attendance fetch error', err);
        this.error = err.error?.message || 'Failed to fetch attendance.';
      },
      complete: () => (this.loading = false),
    });
  }

  loadStudents() {
    this.api.getUsersByRole('student').subscribe({
      next: (res: any) => {
        if (res.users) {
          this.students = res.users;
        } else if (Array.isArray(res)) {
          this.students = res;
        }
        console.log('Students loaded:', this.students.length);
      },
      error: (err) => console.error('Error loading students:', err)
    });
  }

  loadClasses() {
    this.api.getAllClasses().subscribe({
      next: (res: any) => {
        if (res.classes) {
          this.allClasses = res.classes;
        } else if (res.results) {
          this.allClasses = res.results;
        } else if (Array.isArray(res)) {
          this.allClasses = res;
        }
        console.log('Classes loaded:', this.allClasses.length);
      },
      error: (err) => console.error('Error loading classes:', err)
    });
  }

  // Open modal to add new attendance
  openAddModal() {
    this.editMode = false;
    this.showModal = true;
    this.attendanceForm = {
      studentId: null,
      date: new Date().toISOString().split('T')[0], // Today's date
      status: 'Present',
      className: '',
      division: ''
    };
  }

  // Open modal to edit existing attendance
  openEditModal(record: any) {
    this.editMode = true;
    this.showModal = true;
    this.currentRecord = record;

    this.attendanceForm = {
      studentId: record.student?.id || null,
      date: record.date,
      status: record.status,
      className: record.className || record.class_name || '',
      division: record.division || ''
    };
  }

  closeModal() {
    this.showModal = false;
    this.currentRecord = null;
  }

  // Save attendance (add or edit)
  saveAttendance() {
    if (!this.attendanceForm.studentId || !this.attendanceForm.date || !this.attendanceForm.status) {
      alert('Please fill in all required fields!');
      return;
    }

    const payload = {
      student: this.attendanceForm.studentId,
      date: this.attendanceForm.date,
      status: this.attendanceForm.status,
      class_name: this.attendanceForm.className,
      division: this.attendanceForm.division,
      teacher: 1, // TODO: Get current logged-in teacher ID
      marked_by: 'Admin' // TODO: Get current user's name
    };

    console.log('Saving attendance with payload:', payload);
    console.log('Payload types:', {
      student: typeof payload.student,
      teacher: typeof payload.teacher,
      date: typeof payload.date,
      status: typeof payload.status
    });

    if (this.editMode && this.currentRecord) {
      // Update existing record
      this.api.updateAttendance(this.currentRecord.id, payload).subscribe({
        next: () => {
          alert('✅ Attendance updated successfully');
          this.closeModal();
          this.fetchAttendance();
        },
        error: (err) => {
          console.error('Error updating attendance:', err);
          console.error('Backend error details:', err.error);
          alert(JSON.stringify(err.error) || 'Error updating attendance');
        }
      });
    } else {
      // Create new record
      this.api.markAttendance(payload).subscribe({
        next: () => {
          alert('✅ Attendance marked successfully');
          this.closeModal();
          this.fetchAttendance();
        },
        error: (err) => {
          console.error('Error creating attendance:', err);
          console.error('Backend error details:', err.error);
          alert(JSON.stringify(err.error) || 'Error marking attendance');
        }
      });
    }
  }

  // Delete attendance record
  deleteAttendance(id: number) {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
      return;
    }

    this.api.deleteAttendance(id).subscribe({
      next: () => {
        alert('✅ Attendance deleted successfully');
        this.fetchAttendance();
      },
      error: (err) => {
        console.error('Error deleting attendance:', err);
        alert(err.error?.message || 'Error deleting attendance');
      }
    });
  }

  clearFilters() {
    this.search = '';
    this.classFilter = 'all';
    this.divisionFilter = 'all';
    this.statusFilter = 'all';
    this.dateFrom = '';
    this.dateTo = '';
  }

  get filtered(): AttendanceRow[] {
    let rows = [...this.attendance];

    const norm = (s: any) => (s ?? '').toString().toLowerCase();

    if (this.search.trim()) {
      const q = norm(this.search);
      rows = rows.filter(r => norm(r.student?.name).includes(q));
    }

    if (this.classFilter !== 'all') {
      rows = rows.filter(r => (r.className || r.student?.className) === this.classFilter);
    }

    if (this.divisionFilter !== 'all') {
      rows = rows.filter(r => (r.division || r.student?.division) === this.divisionFilter);
    }

    if (this.statusFilter !== 'all') {
      rows = rows.filter(r => r.status === this.statusFilter);
    }

    if (this.dateFrom) {
      const from = new Date(this.dateFrom);
      rows = rows.filter(r => new Date(r.date) >= from);
    }

    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59, 999);
      rows = rows.filter(r => new Date(r.date) <= to);
    }

    rows.sort((a, b) => +new Date(b.date) - +new Date(a.date));

    return rows;
  }

  get presentCount() {
    return this.filtered.filter(r => r.status === 'Present').length;
  }

  get absentCount() {
    return this.filtered.filter(r => r.status === 'Absent').length;
  }

  get totalCount() {
    return this.filtered.length;
  }
}
