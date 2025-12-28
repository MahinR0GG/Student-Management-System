import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  allClasses: any[] = [];
  selectedClassId: number | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];

  classStudents: any[] = [];
  attendanceMap: { [studentId: number]: 'Present' | 'Absent' } = {};
  existingAttendance: any[] = [];
  editingRecordId: number | null = null;  // Track which record is being edited
  editingStatus: 'Present' | 'Absent' = 'Present';  // Temporary status during edit

  // History
  attendanceHistory: any[] = [];
  historyDateFrom: string = '';
  historyDateTo: string = '';

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses() {
    this.api.getAllClasses().subscribe({
      next: (res: any) => {
        this.allClasses = Array.isArray(res) ? res : (res.results || res.classes || []);
        console.log('Classes loaded:', this.allClasses.length);
      },
      error: (err) => console.error('Error loading classes:', err)
    });
  }

  onClassChange() {
    if (this.selectedClassId) {
      this.loadStudentsForClass();
      this.loadAttendanceForDate();
    }
  }

  loadStudentsForClass() {
    if (!this.selectedClassId) return;

    const selectedClass = this.allClasses.find(c => c.id === this.selectedClassId);
    if (!selectedClass) return;

    const className = `${selectedClass.class_number || selectedClass.classNumber}`;
    const division = selectedClass.division;

    this.api.getUsersByClass(className, division).subscribe({
      next: (res: any) => {
        this.classStudents = Array.isArray(res) ? res : (res.results || res.users || []);
        console.log('Students loaded:', this.classStudents.length);

        // Initialize attendance map with default "Present"
        this.attendanceMap = {};
        this.classStudents.forEach(student => {
          this.attendanceMap[student.id] = 'Present';
        });
      },
      error: (err) => console.error('Error loading students:', err)
    });
  }

  loadAttendanceForDate() {
    if (!this.selectedClassId || !this.selectedDate) return;

    const selectedClass = this.allClasses.find(c => c.id === this.selectedClassId);
    if (!selectedClass) return;

    // Backend stores class_name (number) and division separately
    const targetClassNumber = String(selectedClass.class_number || selectedClass.classNumber);
    const targetDivision = selectedClass.division;

    console.log(`Loading attendance for Class ${targetClassNumber} ${targetDivision} on ${this.selectedDate}`);

    // Load existing attendance for this class and date
    this.api.getAllAttendance().subscribe({
      next: (res: any) => {
        const allAttendance = Array.isArray(res) ? res : (res.results || []);

        // Filter for selected class and date
        this.existingAttendance = allAttendance.filter((a: any) => {
          const attendanceDate = a.date.split('T')[0]; // Get date part only

          // Check if record matches class number and division
          // Backend returns class_name as the number string
          const recordClassNumber = String(a.class_name || a.className);
          const recordDivision = a.division;

          const isDateMatch = attendanceDate === this.selectedDate;
          const isClassMatch = recordClassNumber === targetClassNumber && recordDivision === targetDivision;

          return isDateMatch && isClassMatch;
        });

        console.log('Existing attendance loaded:', this.existingAttendance.length);

        // Update attendance map with existing data
        this.attendanceMap = {};
        this.existingAttendance.forEach(record => {
          if (record.student) {
            this.attendanceMap[record.student] = record.status;
          }
        });
      },
      error: (err) => console.error('Error loading attendance:', err)
    });
  }

  getLastMarkedTime(studentId: number): string {
    const record = this.existingAttendance.find((a: any) => a.student === studentId);
    if (!record) return 'Not marked yet';

    if (record.updated_by) {
      return `Updated by ${record.updated_by}`;
    }
    return `Marked by ${record.marked_by || 'Unknown'}`;
  }

  saveAllAttendance() {
    if (!this.selectedClassId || !this.selectedDate) {
      alert('Please select a class and date');
      return;
    }

    const selectedClass = this.allClasses.find(c => c.id === this.selectedClassId);
    if (!selectedClass) return;

    const className = `${selectedClass.class_number || selectedClass.classNumber}${selectedClass.division}`;

    // Get admin user ID from session/local storage
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    const adminId = user.id || 1;

    // Prepare data in the format expected by bulk_mark endpoint
    const data = {
      classId: this.selectedClassId,
      teacherId: adminId,  // Admin acting as teacher
      date: this.selectedDate,
      updated_by: 'Admin',  // Track that admin is editing
      records: this.classStudents.map(student => ({
        studentId: student.id,
        present: this.attendanceMap[student.id] === 'Present'
      }))
    };

    console.log('Saving attendance data:', data);

    // Use bulk mark endpoint
    this.api.markAttendance(data).subscribe({
      next: (response) => {
        console.log('Attendance saved response:', response);
        alert('✅ Attendance saved successfully for all students!');
        this.loadAttendanceForDate();
      },
      error: (err) => {
        console.error('Error saving attendance:', err);
        console.error('Error details:', err.error);
        const errorMsg = err.error?.detail || JSON.stringify(err.error) || 'Unknown error';
        alert('Error saving attendance: ' + errorMsg);
      }
    });
  }

  loadAttendanceHistory() {
    if (!this.selectedClassId) {
      alert('Please select a class first');
      return;
    }

    const selectedClass = this.allClasses.find(c => c.id === this.selectedClassId);
    if (!selectedClass) return;

    const className = `${selectedClass.class_number || selectedClass.classNumber}${selectedClass.division}`;

    this.api.getAllAttendance().subscribe({
      next: (res: any) => {
        let allAttendance = Array.isArray(res) ? res : (res.results || []);

        // Filter by class
        allAttendance = allAttendance.filter((a: any) => {
          const attendanceClass = a.class_name || a.className;
          return attendanceClass === className;
        });

        // Filter by date range if provided
        if (this.historyDateFrom) {
          allAttendance = allAttendance.filter((a: any) => {
            const attendanceDate = a.date.split('T')[0];
            return attendanceDate >= this.historyDateFrom;
          });
        }

        if (this.historyDateTo) {
          allAttendance = allAttendance.filter((a: any) => {
            const attendanceDate = a.date.split('T')[0];
            return attendanceDate <= this.historyDateTo;
          });
        }

        this.attendanceHistory = allAttendance;
        console.log('Attendance history loaded:', this.attendanceHistory.length);
      },
      error: (err) => console.error('Error loading attendance history:', err)
    });
  }

  getClassName(): string {
    if (!this.selectedClassId) return '';
    const selectedClass = this.allClasses.find(c => c.id === this.selectedClassId);
    if (!selectedClass) return '';
    return `${selectedClass.class_number || selectedClass.classNumber}${selectedClass.division}`;
  }


  get historyPresentCount(): number {
    return this.attendanceHistory.filter(a => a.status === 'Present').length;
  }

  get historyAbsentCount(): number {
    return this.attendanceHistory.filter(a => a.status === 'Absent').length;
  }

  // Edit individual attendance record
  editAttendance(record: any) {
    this.editingRecordId = record.id;
    this.editingStatus = record.status;
  }

  saveEdit(record: any) {
    if (!this.editingRecordId) return;

    const updateData = {
      status: this.editingStatus,
      updated_by: 'Admin'
    };

    console.log('Updating attendance record:', this.editingRecordId, updateData);

    this.api.updateAttendance(this.editingRecordId, updateData).subscribe({
      next: (response) => {
        console.log('Update successful:', response);
        // Update the local record
        record.status = this.editingStatus;
        record.updated_by = 'Admin';
        alert('✅ Attendance updated successfully!');
        this.editingRecordId = null;
        this.loadAttendanceForDate();
      },
      error: (err) => {
        console.error('Error updating attendance:', err);
        console.error('Error details:', err.error);
        console.error('Status:', err.status);
        const errorMsg = err.error?.detail || err.error?.message || JSON.stringify(err.error) || 'Unknown error';
        alert('Error updating attendance: ' + errorMsg);
      }
    });
  }

  cancelEdit() {
    this.editingRecordId = null;
  }
}
