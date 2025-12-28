import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css']
})
export class SubjectsComponent implements OnInit {

  subjects: any[] = [];
  teachers: any[] = [];

  // ✅ New subject data - simplified to just name and teacher
  newSubject = {
    name: '',
    teacherId: ''
  };

  message: string | null = null;
  error: string | null = null;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.fetchSubjects();
    this.fetchTeachers();
  }

  /* ✅ Fetch subjects with teacher info */
  fetchSubjects() {
    this.api.getAllSubjects().subscribe({
      next: (res: any) => {
        console.log('Subjects API Response:', res);

        // Handle both response formats (including paginated responses)
        if (res.subjects) {
          this.subjects = res.subjects;
        } else if (res.results) {
          // Django REST framework pagination format
          this.subjects = res.results;
        } else if (Array.isArray(res)) {
          this.subjects = res;
        } else {
          this.subjects = [];
        }

        console.log('Subjects loaded:', this.subjects);
        console.log('Number of subjects:', this.subjects.length);
      },
      error: (err) => {
        console.error("❌ Error fetching subjects", err);
        this.subjects = [];
      }
    });
  }

  /* ✅ Fetch all teachers */
  fetchTeachers() {
    this.api.getAllUsers().subscribe({
      next: (res: any) => {
        console.log('Users API Response:', res);

        // Handle both response formats and filter for teachers
        let allUsers = [];
        if (res.users) {
          allUsers = res.users;
        } else if (Array.isArray(res)) {
          allUsers = res;
        }

        this.teachers = allUsers.filter((u: any) => u.role === 'teacher');
        console.log('Teachers loaded:', this.teachers);
      },
      error: (err) => console.error("❌ Error fetching teachers", err)
    });
  }

  /* ✅ Add Subject */
  addSubject() {
    this.error = null;
    this.message = null;

    if (!this.newSubject.teacherId) {
      this.error = "Please select a teacher!";
      return;
    }

    // Find the selected teacher to get their subject
    const selectedTeacher = this.teachers.find((t: any) => t.id === Number(this.newSubject.teacherId));
    
    if (!selectedTeacher || !selectedTeacher.subject) {
      this.error = "Selected teacher has no subject assigned!";
      return;
    }

    // ✅ Backend expects snake_case field names
    // Use the teacher's subject, not a user-entered one
    const payload = {
      name: selectedTeacher.subject,  // Use teacher's actual subject
      class_teacher: this.newSubject.teacherId,
      class_name: 'General'  // Temporary default until migration makes it optional
    };

    console.log('Creating subject with payload:', payload);

    this.api.createSubject(payload).subscribe({
      next: (res) => {
        this.message = "Subject added successfully!";
        this.fetchSubjects();
        this.newSubject = { name: '', teacherId: '' };
      },
      error: (err) => {
        console.error('Error adding subject:', err);
        this.error = err.error?.message || "Error adding subject";
      }
    });
  }

  /* ✅ Delete Subject */
  deleteSubject(id: number) {
    if (!confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    this.api.deleteSubject(id).subscribe({
      next: () => this.fetchSubjects(),
      error: (err) => console.error("❌ Error deleting subject", err)
    });
  }

  /* ✅ Get teacher's subject */
  getTeacherSubject(teacherId: any): string {
    if (!teacherId) return '';
    const teacher = this.teachers.find((t: any) => t.id === Number(teacherId));
    return teacher?.subject || '';
  }
}
