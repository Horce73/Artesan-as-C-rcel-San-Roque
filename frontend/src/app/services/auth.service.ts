import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/san-roque.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; pass: string }): Observable<{ access_token: string; user: User }> {
    return this.http.post<{ access_token: string; user: User }>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        sessionStorage.setItem('sanroque_token', res.access_token);
        sessionStorage.setItem('sanroque_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem('sanroque_token');
    sessionStorage.removeItem('sanroque_user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return sessionStorage.getItem('sanroque_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getStoredUser(): User | null {
    const raw = sessionStorage.getItem('sanroque_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
