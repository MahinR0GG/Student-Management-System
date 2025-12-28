import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-manage-classes",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./manage-classes.component.html",
  styleUrls: ["./manage-classes.component.css"],
})
export class ManageClassesComponent implements OnInit {

  classes: any[] = [];
  teachers: any[] = [];
  searchTerm: string = "";
  showAddModal = false;

  subjectList: string[] = [];

  // ✅ Updated class object
  newClass = {
    classNumber: null as number | null,
    division: "",
    classTeacherId: null as number | null,
    subjectTeachers: {} as any
  };

  // ✅ Edit Modal State
  showEditModal = false;
  selectedClass: any = null;
  classSubjects: any[] = [];
  newSubject = {
    name: '',
    teacher: null as number | null
  };

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadClasses();
    this.loadTeachers();
  }

  // ✅ Load classes
  loadClasses() {
    this.api.getAllClasses().subscribe({
      next: (res: any) => {
        console.log('Classes API Response:', res);

        // Handle both response formats (including paginated)
        if (res.classes) {
          this.classes = res.classes;
        } else if (res.results) {
          // Django REST framework pagination format
          this.classes = res.results;
        } else if (Array.isArray(res)) {
          this.classes = res;
        } else {
          this.classes = [];
        }

        console.log('Classes loaded:', this.classes.length);
      },
      error: (err) => console.error("❌ Error loading classes:", err)
    });
  }

  // ✅ Load all teachers + extract subjects
  loadTeachers() {
    this.api.getAllTeachers().subscribe({
      next: (res: any) => {
        console.log('Teachers API Response:', res);

        // Handle all response formats - ensure we get an array
        if (res.users && Array.isArray(res.users)) {
          this.teachers = res.users;
        } else if (res.teachers && Array.isArray(res.teachers)) {
          this.teachers = res.teachers;
        } else if (res.results && Array.isArray(res.results)) {
          this.teachers = res.results;
        } else if (Array.isArray(res)) {
          this.teachers = res;
        } else {
          console.warn('Unexpected response format:', res);
          this.teachers = [];
        }

        console.log('Teachers loaded:', this.teachers.length);

        // ✅ Extract unique subjects - only if teachers is an array
        if (Array.isArray(this.teachers)) {
          this.subjectList = [
            ...new Set(
              this.teachers.map(t => t.subject).filter(Boolean)
            )
          ];
        }
      },
      error: (err) => {
        console.error("❌ Error loading teachers:", err);
        this.teachers = [];
      }
    });
  }

  // ✅ Filter teachers by subject
  getTeachersBySubject(subject: string) {
    return this.teachers.filter(t => t.subject === subject);
  }

  // ✅ Open modal
  openAddModal() {
    this.showAddModal = true;
  }

  // ✅ Close + reset
  closeModal() {
    this.showAddModal = false;
    this.newClass = {
      classNumber: null,
      division: "",
      classTeacherId: null,
      subjectTeachers: {}
    };
  }

  // ✅ Create Class
  createClass() {

    if (!this.newClass.classNumber || !this.newClass.division || !this.newClass.classTeacherId) {
      alert("⚠ Please fill all required fields!");
      return;
    }

    console.log('Raw form values:', {
      classNumber: this.newClass.classNumber,
      division: this.newClass.division,
      classTeacherId: this.newClass.classTeacherId,
      types: {
        classNumber: typeof this.newClass.classNumber,
        classTeacherId: typeof this.newClass.classTeacherId
      }
    });

    // ✅ Backend expects snake_case field names and integer values
    const payload = {
      class_number: Number(this.newClass.classNumber),
      division: this.newClass.division,
      class_teacher: Number(this.newClass.classTeacherId),
      subject_teachers: this.newClass.subjectTeachers || {}
    };

    console.log('Creating class with payload:', payload);
    console.log('Payload field types:', {
      class_number: typeof payload.class_number,
      class_teacher: typeof payload.class_teacher,
      isNaN_class_number: isNaN(payload.class_number),
      isNaN_class_teacher: isNaN(payload.class_teacher)
    });

    this.api.createClass(payload).subscribe({
      next: () => {
        alert("✅ Class created successfully");
        this.closeModal();
        this.loadClasses();
        this.loadTeachers();
      },
      error: (err) => {
        console.error("❌ Error adding class:", err);
        console.error("Error response:", err.error);

        let errorMsg = "Error creating class";
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.message) {
            errorMsg = err.error.message;
          } else {
            errorMsg = JSON.stringify(err.error);
          }
        }
        alert(errorMsg);
      }
    });
  }

  // ✅ Search Filter
  get filteredClasses() {
    const term = this.searchTerm.toLowerCase();

    return this.classes.filter((c: any) => {
      const className = `${c.classNumber}${c.division}`.toLowerCase();
      const teacherName = c.classTeacher?.toLowerCase() || "";
      return className.includes(term) || teacherName.includes(term);
    });
  }

  // ✅ Get teacher subject by teacher ID
  getTeacherSubject(teacherId: number): string {
    if (!teacherId || !Array.isArray(this.teachers)) {
      return '-';
    }
    const teacher = this.teachers.find(t => t.id === teacherId);
    return teacher?.subject || '-';
  }

  // ✅ Edit Modal Methods
  openEditModal(classItem: any) {
    this.selectedClass = classItem;
    this.showEditModal = true;
    this.loadClassSubjects(classItem.id);
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedClass = null;
    this.classSubjects = [];
    this.newSubject = {
      name: '',
      teacher: null
    };
  }

  loadClassSubjects(classId: number) {
    this.api.getSubjectsByClass(classId).subscribe({
      next: (res: any) => {
        this.classSubjects = Array.isArray(res) ? res : (res.results || []);
        console.log('Class subjects loaded:', this.classSubjects);
      },
      error: (err) => console.error('❌ Error loading subjects:', err)
    });
  }

  assignSubject() {
    if (!this.newSubject.name || !this.newSubject.teacher) {
      alert('⚠️ Please fill in subject name and select a teacher');
      return;
    }

    // Build class_name from selected class
    const className = `${this.selectedClass.class_number || this.selectedClass.classNumber}${this.selectedClass.division}`;

    // Backend expects: name, class_name, class_teacher
    const payload = {
      name: this.newSubject.name,
      class_name: className,
      class_teacher: this.newSubject.teacher
    };

    console.log('Assigning subject with payload:', payload);

    this.api.createSubject(payload).subscribe({
      next: () => {
        alert('✅ Subject assigned successfully');
        this.newSubject = { name: '', teacher: null };
        this.loadClassSubjects(this.selectedClass.id);
      },
      error: (err) => {
        console.error('❌ Error assigning subject:', err);
        const errorMsg = err.error?.message || err.error || 'Error assigning subject';
        alert(errorMsg);
      }
    });
  }

  removeSubject(subjectId: number) {
    if (!confirm('Are you sure you want to remove this subject?')) {
      return;
    }

    this.api.deleteSubject(subjectId).subscribe({
      next: () => {
        alert('✅ Subject removed successfully');
        this.loadClassSubjects(this.selectedClass.id);
      },
      error: (err) => {
        console.error('❌ Error removing subject:', err);
        alert('Error removing subject');
      }
    });
  }
}
