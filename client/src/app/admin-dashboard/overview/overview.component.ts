import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  stats = {
    students: 0,
    teachers: 0,
    classes: 0,
    attendanceToday: '0%',
    leavesPending: 0,
    eventsThisMonth: 0
  };

  recentActivity: any[] = [];

  quickActions = [
    { text: 'Manage Users', link: '/admin-dashboard/manage-users' },
    { text: 'Manage Classes', link: '/admin-dashboard/manage-classes' },
    { text: 'Add Event', link: '/admin-dashboard/events' },
    { text: 'View Leave Requests', link: '/admin-dashboard/leave-requests' }
  ];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.api.getAdminStats().subscribe({
      next: (res: any) => {
        if (res.stats) {
          this.stats = { ...this.stats, ...res.stats };
        }
        if (res.recentActivity) {
          this.recentActivity = res.recentActivity;
        }
      },
      error: (err) => {
        console.error('Error fetching admin stats:', err);
      }
    });
  }

}
