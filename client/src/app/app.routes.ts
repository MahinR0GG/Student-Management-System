import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // ✅ TEACHER ROLE SELECTION
  {
    path: 'teacher/role-select',
    loadComponent: () =>
      import('./teacher-role-select/teacher-role-select.component')
        .then(m => m.TeacherRoleSelectComponent),
  },

  // ✅ CLASS TEACHER DASHBOARD
  {
    path: 'teacher/class-dashboard/:classId',
    loadComponent: () =>
      import('./class-teacher-dashboard/class-teacher-dashboard.component')
        .then(m => m.ClassTeacherDashboardComponent),
  },

  // ✅ SUBJECT TEACHER DASHBOARD
  {
    path: 'teacher/subject-dashboard',
    loadComponent: () =>
      import('./subject-teacher-dashboard/subject-teacher-dashboard.component')
        .then(m => m.SubjectTeacherDashboardComponent),
  },

  // ✅ ADMIN
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },

      {
        path: 'overview',
        loadComponent: () =>
          import('./admin-dashboard/overview/overview.component')
            .then(m => m.OverviewComponent),
      },

      {
        path: 'manage-users',
        loadComponent: () =>
          import('./admin-dashboard/manage-users/manage-users.component')
            .then(m => m.ManageUsersComponent),
      },

      {
        path: 'manage-classes',
        loadComponent: () =>
          import('./admin-dashboard/manage-classes/manage-classes.component')
            .then(m => m.ManageClassesComponent),
      },

      {
        path: 'subjects',
        loadComponent: () =>
          import('./admin-dashboard/subjects/subjects.component')
            .then(m => m.SubjectsComponent),
      },

      {
        path: 'attendance',
        loadComponent: () =>
          import('./admin-dashboard/attendance/attendance.component')
            .then(m => m.AttendanceComponent),
      },

      {
        path: 'leave-requests',
        loadComponent: () =>
          import('./admin-dashboard/leave-requests/leave-requests.component')
            .then(m => m.LeaveRequestsComponent),
      },

      {
        path: 'events',
        loadComponent: () =>
          import('./admin-dashboard/events/events.component')
            .then(m => m.EventsComponent),
      },
    ],
  },

  // ✅ STUDENT DASHBOARD
  {
    path: 'student-dashboard',
    loadComponent: () =>
      import('./student-dashboard/student-dashboard.component')
        .then(m => m.StudentDashboardComponent),
  },

  { path: '**', redirectTo: 'login' }
];
