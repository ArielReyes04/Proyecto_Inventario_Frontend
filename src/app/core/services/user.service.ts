import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../env';

export interface UserResponse {
  idPerson: string;
  username: string;
  role: string;
  active: boolean;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/v1/users/`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/admin/users/register`, userData, { responseType: 'text' as 'json' });
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/admin/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/admin/users/${id}`, { responseType: 'text' as 'json' });
  }

  toggleUserStatus(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/admin/users/${id}/toggle-active`, {});
  }
}
