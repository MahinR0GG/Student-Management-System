import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './app-auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.cosmponent.css'] // Note: possible typo, maybe 'component.css'?
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  userType: string = '';
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onLogin(): void {
    this.error = '';
       if (!this.username || !this.password || !this.userType) {
      this.error = 'Please fill all fields';
      return;
    }

    // --- NEW: Frontend-Only Navigation Logic ---
    // This logic correctly checks the userType you selected.
    if (this.userType === 'student') {
      this.router.navigate(['/student-dashboard']);
    } else if (this.userType === 'teacher') {
      this.router.navigate(['/teacher-role-select']);
    } else {
      // You can handle admin or other types here
      this.error = 'User type not recognized for this demo.';
    }
    // --- End of New Logic ---


    // --- Original Backend Logic (Commented Out) ---
    /*
    const payload = {
      username: this.username,
      password: this.password,
      userType: this.userType
    };
    this.authService.login(payload)
      .subscribe({
        next: (response) => {
          // Handle successful login
          // *** THIS WAS THE BUG: It always goes to one place ***
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.error = 'Wrong details';
          // Tip: Open your browser's Developer Tools (F12) -> Network tab
          // to see if the login is actually failing.
        }
      });
  }
}
    */  }
}