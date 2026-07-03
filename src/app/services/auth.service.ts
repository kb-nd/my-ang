import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/user.model';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = '/api/auth';
  private usersApiUrl = '/api/users';

  #currentUser = signal<User | null>(null);
  #token = signal<string | null>(localStorage.getItem('auth_token'));
  #isLoading = signal(false);

  currentUser = computed(() => this.#currentUser());
  token = computed(() => this.#token());
  isAuthenticated = computed(() => !!this.#token() && !!this.#currentUser());
  isLoading = computed(() => this.#isLoading());

  constructor() {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser && this.#token()) {
      this.#currentUser.set(JSON.parse(savedUser));
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.#token();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    });
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.#isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setSession(response)),
      catchError(err => {
        this.#isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this.#isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.setSession(response)),
      catchError(err => {
        this.#isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.#currentUser.set(null);
    this.#token.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.usersApiUrl}/me/profile`, { headers: this.getAuthHeaders() }).pipe(
      tap(user => {
        this.#currentUser.set(user);
        localStorage.setItem('current_user', JSON.stringify(user));
      })
    );
  }

  updateProfile(updates: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.usersApiUrl}/me/profile`, updates, { headers: this.getAuthHeaders() }).pipe(
      tap(user => {
        this.#currentUser.set(user);
        localStorage.setItem('current_user', JSON.stringify(user));
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.usersApiUrl}/me/password`, data, { headers: this.getAuthHeaders() });
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.usersApiUrl}/me/account`, { headers: this.getAuthHeaders() }).pipe(
      tap(() => this.logout())
    );
  }

  private setSession(response: AuthResponse): void {
    this.#token.set(response.token);
    this.#currentUser.set(response.user);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.#isLoading.set(false);
  }
}