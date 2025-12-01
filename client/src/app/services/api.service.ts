import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api'; // Django backend URL

  constructor(private http: HttpClient) { }

  // HTTP Options
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  // ========== Class Teacher ==========
  getClassForClassTeacher(teacherId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/classes/by_class_teacher/?teacher_id=${teacherId}`,
      this.getHttpOptions()
    );
  }

  getClassTeacherDashboard(teacherId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/classes/teacher_dashboard/?teacher_id=${teacherId}`,
      this.getHttpOptions()
    );
  }

  getSubjectTeacherDashboard(teacherId: number, classId?: number): Observable<any> {
    let url = `${this.baseUrl}/classes/subject_teacher_dashboard/?teacher_id=${teacherId}`;
    if (classId) {
      url += `&class_id=${classId}`;
    }
    return this.http.get(url, this.getHttpOptions());
  }

  // ========== Authentication ==========
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials, this.getHttpOptions());
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData, this.getHttpOptions());
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/stats`, this.getHttpOptions());
  }

  // ========== Users ==========
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/`, this.getHttpOptions());
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}/`, this.getHttpOptions());
  }

  getUsersByRole(role: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/?role=${role}`, this.getHttpOptions());
  }

  getAllTeachers(): Observable<any> {
    return this.getUsersByRole('teacher');
  }

  getUsersByClass(className: string, division?: string): Observable<any> {
    let url = `${this.baseUrl}/users/?className=${className}`;
    if (division) {
      url += `&division=${division}`;
    }
    return this.http.get(url, this.getHttpOptions());
  }

  getStudentsByTeacher(teacherId: number): Observable<any> {
    return this.getTeacherClass(teacherId).pipe(
      map((classData: any) => {
        if (classData && classData.class_number && classData.division) {
          return this.getUsersByClass(classData.class_number.toString(), classData.division);
        }
        return { students: [] };
      })
    );
  }

  getStudentProfile(studentId: number): Observable<any> {
    return this.getUserById(studentId);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/`, userData, this.getHttpOptions());
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/`, userData, this.getHttpOptions());
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}/`, this.getHttpOptions());
  }

  // ========== Classes ==========
  getAllClasses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/classes/`, this.getHttpOptions());
  }



  getClassById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/classes/${id}/`, this.getHttpOptions());
  }

  getTeacherClass(teacherId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/classes/?teacherId=${teacherId}`, this.getHttpOptions()).pipe(
      map((response: any) => {
        if (Array.isArray(response) && response.length > 0) {
          return response[0];
        } else if (response.results && response.results.length > 0) {
          return response.results[0];
        }
        return null;
      })
    );
  }

  createClass(classData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/classes/`, classData, this.getHttpOptions());
  }

  updateClass(id: number, classData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/classes/${id}/`, classData, this.getHttpOptions());
  }

  deleteClass(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/classes/${id}/`, this.getHttpOptions());
  }

  // ========== Attendance ==========
  getAllAttendance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/attendance/`, this.getHttpOptions());
  }

  getAttendanceByStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/attendance/?student=${studentId}`, this.getHttpOptions()).pipe(
      map((response: any) =>
        response?.results ? response.results : Array.isArray(response) ? response : []
      )
    );
  }

  getAttendanceByDate(date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/attendance/?date=${date}`, this.getHttpOptions());
  }

  getAttendanceByClass(className: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/attendance/?className=${className}`, this.getHttpOptions());
  }

  getTodayAttendance(classId: number, date: string): Observable<any> {
    return this.getClassById(classId).pipe(
      map((classData: any) => {
        if (classData) {
          const className = `${classData.class_number}${classData.division}`;
          return this.http.get(`${this.baseUrl}/attendance/?className=${className}&date=${date}`, this.getHttpOptions());
        }
        return { attendance: [] };
      })
    );
  }

  markAttendance(attendanceData: any): Observable<any> {
    // Use the new bulk_mark endpoint
    return this.http.post(`${this.baseUrl}/attendance/bulk_mark/`, attendanceData, this.getHttpOptions());
  }

  updateAttendance(id: number, attendanceData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/attendance/${id}/`, attendanceData, this.getHttpOptions());
  }

  deleteAttendance(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/attendance/${id}/`, this.getHttpOptions());
  }

  // ========== Leaves ==========
  getAllLeaves(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaves/`, this.getHttpOptions());
  }

  getClassLeaveRequests(classId: number): Observable<any> {
    // Assumes backend supports filtering leaves by classId
    return this.http.get(`${this.baseUrl}/leaves/?class_id=${classId}`, this.getHttpOptions());
  }

  getAllLeaveRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaves/`, this.getHttpOptions()).pipe(
      map((response: any) =>
        response?.results ? response.results : Array.isArray(response) ? response : []
      )
    );
  }

  getLeavesByStudent(studentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaves/?student=${studentId}`, this.getHttpOptions()).pipe(
      map((response: any) =>
        response?.results ? response.results : Array.isArray(response) ? response : []
      )
    );
  }

  getLeaveHistory(studentId: number): Observable<any> {
    return this.getLeavesByStudent(studentId);
  }

  getLeavesByStatus(status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaves/?status=${status}`, this.getHttpOptions());
  }

  createLeave(leaveData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/leaves/`, leaveData, this.getHttpOptions());
  }

  applyLeave(studentId: number, leaveData: any): Observable<any> {
    return this.createLeave({ ...leaveData, student: studentId });
  }

  updateLeave(id: number, leaveData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/leaves/${id}/`, leaveData, this.getHttpOptions());
  }

  approveLeave(leaveId: number): Observable<any> {
    return this.updateLeave(leaveId, { status: 'Approved' });
  }

  rejectLeave(leaveId: number): Observable<any> {
    return this.updateLeave(leaveId, { status: 'Rejected' });
  }

  deleteLeave(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/leaves/${id}/`, this.getHttpOptions());
  }

  // ========== Subjects ==========
  getAllSubjects(): Observable<any> {
    return this.http.get(`${this.baseUrl}/subjects/`, this.getHttpOptions());
  }

  createSubject(subjectData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/subjects/`, subjectData, this.getHttpOptions());
  }

  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/subjects/${id}/`, this.getHttpOptions());
  }

  getSubjectsByClass(classIdentifier: string | number): Observable<any> {
    const param = typeof classIdentifier === 'number' ? `class_id=${classIdentifier}` : `className=${classIdentifier}`;
    return this.http.get(`${this.baseUrl}/subjects/?${param}`, this.getHttpOptions());
  }

  getStudentSubjects(studentId: number): Observable<any> {
    return this.getUserById(studentId).pipe(
      map((student: any) =>
        student?.className ? this.getSubjectsByClass(student.className) : { subjects: [] }
      )
    );
  }

  // ========== Events ==========
  getAllEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/`, this.getHttpOptions()).pipe(
      map((response: any) =>
        response?.results ? response.results : Array.isArray(response) ? response : []
      )
    );
  }

  getAdminEvents(): Observable<any> {
    return this.getAllEvents();
  }

  getEventsByAudience(audience: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/?audience=${audience}`, this.getHttpOptions());
  }

  getEventsByClass(className: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/events/?className=${className}`, this.getHttpOptions()).pipe(
      map((response: any) =>
        response?.results ? response.results : Array.isArray(response) ? response : []
      )
    );
  }

  getClassEvents(classId: number): Observable<any> {
    return this.getClassById(classId).pipe(
      map((classData: any) =>
        classData ? this.getEventsByClass(`${classData.class_number}`) : { events: [] }
      )
    );
  }

  getStudentEvents(studentId: number): Observable<any> {
    return this.getUserById(studentId).pipe(
      map((student: any) =>
        student?.className ? this.getEventsByClass(student.className) : { events: [] }
      )
    );
  }

  createEvent(eventData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/events/`, eventData, this.getHttpOptions());
  }

  updateEvent(id: number, eventData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/events/${id}/`, eventData, this.getHttpOptions());
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/events/${id}/`, this.getHttpOptions());
  }

  // ========== Teacher Subjects ==========
  getTeacherSubjects(teacherId: number): Observable<any> {
    // Assumes backend supports filtering subjects by teacherId
    return this.http.get(`${this.baseUrl}/subjects/?teacher_id=${teacherId}`, this.getHttpOptions());
  }

  // ========== Marks ==========
  getMarksByClass(classId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/marks/by_class/?class_id=${classId}`,
      this.getHttpOptions()
    );
  }

  getMarksByStudent(studentId: number): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/marks/?student_id=${studentId}`,
      this.getHttpOptions()
    );
  }

  createMarks(marksData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/marks/`, marksData, this.getHttpOptions());
  }

  updateMarks(id: number, marksData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/marks/${id}/`, marksData, this.getHttpOptions());
  }

  deleteMarks(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/marks/${id}/`, this.getHttpOptions());
  }
}
