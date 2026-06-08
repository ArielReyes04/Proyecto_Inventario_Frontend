import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/v1/users/me`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/v1/users/me`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/api/v1/users/me/password`, data, { responseType: 'text' as 'json' });
  }
}
