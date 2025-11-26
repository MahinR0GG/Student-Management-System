import { Component } from '@angular/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent {

  // Mock stats (later replace with API)
  stats = {
    students: 420,
    teachers: 28,
    classes: 12,
    attendanceToday: '92%',
    leavesPending: 6,
    eventsThisMonth: 3
  };

  recentActivity = [
    { text: 'Student A applied for leave', time: '2 hrs ago' },
    { text: 'Teacher Priya marked attendance', time: '4 hrs ago' },
    { text: 'New student added to Class 10A', time: 'Yesterday' },
    { text: 'Exam schedule updated', time: 'Yesterday' }
  ];

  quickActions = [
    { text: 'Manage Users', link: '/admin-dashboard/manage-users' },
    { text: 'Manage Classes', link: '/admin-dashboard/manage-classes' },
    { text: 'Add Event', link: '/admin-dashboard/events' },
    { text: 'View Leave Requests', link: '/admin-dashboard/leave-requests' }
  ];

}
