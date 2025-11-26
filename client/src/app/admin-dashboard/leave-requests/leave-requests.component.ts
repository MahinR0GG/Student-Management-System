import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-leave-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.css'],
})
export class LeaveRequestsComponent implements OnInit, OnDestroy {

  leaveFilter = 'students'; // default tab

  // ✅ REAL Student Leave Requests (from backend)
  studentLeaves: any[] = [];

  private destroy$ = new Subject<void>();
  private refreshInterval = 10000; // ✅ REAL-TIME: Refresh every 10 seconds

  constructor(private api: ApiService) { }

  // ============================
  // ✅ Load Student Leave List (REAL-TIME)
  // ============================
  ngOnInit(): void {
    // Initial load
    this.loadStudentLeaves();

    // 🔄 Real-time refresh: Poll backend every 10 seconds
    interval(this.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('🔄 Real-time sync: Refreshing leave requests...');
        this.loadStudentLeaves();
      });
  }

  loadStudentLeaves() {
    this.api.getAllLeaveRequests().subscribe({
      next: (leaves: any[]) => {
        console.log('✅ Leave Requests updated (real-time):', leaves);

        // Direct array from API service (already processed)
        if (Array.isArray(leaves)) {
          this.studentLeaves = leaves.map((leave: any) => ({
            id: leave.id,
            student_name: leave.student_name || 'Unknown Student',
            start_date: leave.start_date,
            end_date: leave.end_date,
            reason: leave.reason,
            status: leave.status,
            details: leave.details || ''
          }));
        } else {
          this.studentLeaves = [];
        }

        console.log('Processed Leave Requests:', this.studentLeaves);
      },
      error: (err) => {
        console.error("❌ Error loading leave requests:", err);
        this.studentLeaves = [];
      }
    });
  }

  // ============================
  // ✅ Approve / Reject Student Leave
  // ============================
  approveStudent(item: any) {
    if (!item || !item.id) {
      alert('❌ Invalid leave request');
      return;
    }

    console.log('Approving leave:', item.id);
    this.api.approveLeave(item.id).subscribe({
      next: (response) => {
        console.log('✅ Approval successful:', response);
        item.status = 'Approved';
        alert('✅ Leave request approved');
        // Refresh data to see all changes
        this.loadStudentLeaves();
      },
      error: (err) => {
        console.error('❌ Error approving leave:', err);
        alert('❌ Error approving leave: ' + (err.error?.detail || err.message || 'Unknown error'));
      }
    });
  }

  rejectStudent(item: any) {
    if (!item || !item.id) {
      alert('❌ Invalid leave request');
      return;
    }

    console.log('Rejecting leave:', item.id);
    this.api.rejectLeave(item.id).subscribe({
      next: (response) => {
        console.log('✅ Rejection successful:', response);
        item.status = 'Rejected';
        alert('✅ Leave request rejected');
        // Refresh data to see all changes
        this.loadStudentLeaves();
      },
      error: (err) => {
        console.error('❌ Error rejecting leave:', err);
        alert('❌ Error rejecting leave: ' + (err.error?.detail || err.message || 'Unknown error'));
      }
    });
  }

  // ✅ Cleanup subscription on component destroy
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================
  // ✅ Teacher Leave Functions (COMMENTED)
  // ============================
  /*
  assignSubstitute(item: any) { 
    alert(`Substitute assigned: ${item.substitute}`); 
  }
  approveTeacher(item: any) { item.status = 'Approved'; }
  rejectTeacher(item: any) { item.status = 'Rejected'; }
  */
}
