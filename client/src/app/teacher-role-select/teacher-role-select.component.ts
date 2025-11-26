import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teacher-role-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-role-select.component.html',
  styleUrls: ['./teacher-role-select.component.css']
})
export class TeacherRoleSelectComponent {

  user: any = null;
  classAssigned: any = null;
  isClassTeacher: boolean = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!this.user || !this.user.id) {
      console.error('User not found, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Checking if teacher is class teacher:', this.user.id);

    // Check if this teacher is a class teacher
    this.api.getClassForClassTeacher(this.user.id).subscribe({
      next: (cls: any) => {
        console.log('Class data received:', cls);
        if (cls && cls.id) {
          this.classAssigned = cls;
          this.isClassTeacher = true;
          console.log('Teacher is assigned as class teacher');
        } else {
          this.classAssigned = null;
          this.isClassTeacher = false;
          console.log('Teacher is NOT assigned as class teacher');
        }
      },
      error: (err) => {
        console.error('Error checking class teacher status:', err);
        this.classAssigned = null;
        this.isClassTeacher = false;
      }
    });
  }

  goToClassTeacher() {
    console.log('goToClassTeacher called - isClassTeacher:', this.isClassTeacher, 'classAssigned:', this.classAssigned);
    
    if (!this.isClassTeacher || !this.classAssigned) {
      alert("❌ You are not assigned as a Class Teacher.");
      console.warn('Cannot navigate: isClassTeacher=', this.isClassTeacher, 'classAssigned=', this.classAssigned);
      return;
    }
    
    console.log('Navigating to class dashboard with classId:', this.classAssigned.id);
    // Redirect to the class teacher dashboard for the assigned class
    this.router.navigate(['/teacher/class-dashboard', this.classAssigned.id]).then(
      success => console.log('Navigation successful:', success),
      error => console.error('Navigation failed:', error)
    );
  }

  goToSubjectTeacher() {
    this.router.navigate(['/teacher/subject-dashboard']);
  }
}
