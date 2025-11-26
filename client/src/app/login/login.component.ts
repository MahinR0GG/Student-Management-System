import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginData = {
    email: '',
    password: '',
    userType: ''
  };

  error: string | null = null;

  constructor(private api: ApiService, private router: Router) {}

  onSubmit() {
    this.error = null;

    if (!this.loginData.email || !this.loginData.password || !this.loginData.userType) {
      this.error = 'Please fill all fields.';
      return;
    }

    this.api.login(this.loginData).subscribe({
      next: (res) => {
        localStorage.setItem('user', JSON.stringify(res.user));

        const role = res.user.role.toLowerCase();

        if (role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        }
        else if (role === 'teacher') {
          // ✅ go to role select
          this.router.navigate(['/teacher/role-select']);
        }
        else if (role === 'student') {
          this.router.navigate(['/student-dashboard']);
        }
        else {
          this.error = 'Invalid role.';
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed.';
      }
    });
  }
}
