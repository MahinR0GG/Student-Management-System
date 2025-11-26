import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  login(payload): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, payload, { observe: 'response' });
  }
}