import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should store token and update currentUser on login', () => {
    const mockCredentials = { username: 'testuser', password: 'password' };
    const mockResponse = { token: 'header.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGVzIjpbIkFkbWluaXN0cmFkb3IiXX0.signature' };

    service.login(mockCredentials).subscribe(response => {
      expect(response.token).toBe(mockResponse.token);
      expect(localStorage.getItem('token')).toBe(mockResponse.token);
      
      const user = service.currentUser;
      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.roles).toContain('Administrador');
      expect(service.isAdmin()).toBeTrue();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear token and currentUser on logout', () => {
    localStorage.setItem('token', 'some-token');
    service.logout();
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(service.currentUser).toBeNull();
  });
});
