import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  users: any[] = [];
  searchTerm: string = "";
  roleFilter: string = "all";
  isAddFormVisible: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = "";

  selectedRole: string = "student";

  // High school only
  classes = [8, 9, 10];
  divisions = ['A', 'B', 'C'];
  
  subjects = ['English', 'Hindi', 'Maths', 'Science', 'Physics', 'Chemistry', 'Biology'];

  user = {
    name: "",
    email: "",
    password: "",
    role: "student",
    classNumber: null as number | null,
    division: "",
    subject: ""
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.isLoading = true;
    this.errorMessage = "";
    
    this.api.getAllUsers().subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        
        // Handle both response formats
        if (res.users) {
          this.users = res.users;
        } else if (Array.isArray(res)) {
          this.users = res;
        } else {
          this.users = [];
        }
        
        this.isLoading = false;
        console.log('Users loaded:', this.users);
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.errorMessage = 'Failed to load users. Please try again.';
        this.isLoading = false;
        this.users = [];
      }
    });
  }

  openAdd() {
    this.isAddFormVisible = !this.isAddFormVisible;
    if (this.isAddFormVisible) {
      this.resetForm();
    }
  }

  resetForm() {
    this.user = {
      name: "",
      email: "",
      password: "",
      role: "student",
      classNumber: null,
      division: "",
      subject: ""
    };
    this.selectedRole = "student";
    this.errorMessage = "";
  }

  onRoleChange(event: any) {
    this.selectedRole = event.target.value;
    this.user.role = this.selectedRole;
    
    // Reset role-specific fields
    if (this.selectedRole !== 'student') {
      this.user.classNumber = null;
      this.user.division = "";
    }
    if (this.selectedRole !== 'teacher') {
      this.user.subject = "";
    }
  }

  addUser() {
    // Validation
    if (!this.user.name || !this.user.email || !this.user.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.selectedRole === 'student' && (!this.user.classNumber || !this.user.division)) {
      this.errorMessage = 'Please select class and division for student';
      return;
    }

    if (this.selectedRole === 'teacher' && !this.user.subject) {
      this.errorMessage = 'Please select subject for teacher';
      return;
    }

    const payload: any = {
      name: this.user.name,
      email: this.user.email,
      password: this.user.password,
      role: this.selectedRole
    };

    if (this.selectedRole === "student") {
      payload.className = this.user.classNumber.toString();
      payload.division = this.user.division;
    }

    if (this.selectedRole === "teacher") {
      payload.subject = this.user.subject;
    }

    console.log('Creating user with payload:', payload);
    this.isLoading = true;
    this.errorMessage = "";

    this.api.createUser(payload).subscribe({
      next: (res: any) => {
        console.log('User created:', res);
        this.isAddFormVisible = false;
        this.resetForm();
        this.fetchUsers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.errorMessage = error.error?.message || 'Failed to create user. Please try again.';
        this.isLoading = false;
      }
    });
  }

  deleteUser(userId: number) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.isLoading = true;
    this.api.deleteUser(userId).subscribe({
      next: (res: any) => {
        console.log('User deleted:', res);
        this.fetchUsers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.errorMessage = 'Failed to delete user. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get filteredUsers() {
    if (!this.users || this.users.length === 0) {
      return [];
    }

    return this.users.filter(u => {
      const matchesRole = this.roleFilter === "all" || u.role === this.roleFilter;
      const matchesSearch = !this.searchTerm || 
        u.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesRole && matchesSearch;
    });
  }

  getUserDisplayInfo(user: any): string {
    if (user.role === 'student' && user.className && user.division) {
      return `${user.className}${user.division}`;
    } else if (user.role === 'teacher' && user.subject) {
      return user.subject;
    }
    return '-';
  }

  getUserDetails(user: any): string {
    if (user.role === 'student') {
      const className = user.className || user.classNumber || '-';
      const division = user.division || '-';
      return `${className}${division}`;
    } else if (user.role === 'teacher') {
      return user.subject || '-';
    }
    return '-';
  }
}