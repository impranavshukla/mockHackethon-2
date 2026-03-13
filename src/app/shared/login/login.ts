import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private apiUrl = 'https://localhost:7215/api/User/login';

  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const payload = {
      email: this.email,
      password: this.password,
    };

    this.http.post(this.apiUrl, payload, { responseType: 'text' }).subscribe({
      next: (res: string) => {
        this.isLoading = false;
        console.log('=== RAW API Response ===', res);

        let parsed: any;
        try {
          parsed = JSON.parse(res);
        } catch {
          parsed = { token: res };
        }

        // API returns { message, user: { id, name, role, ... } }
        // Extract the nested user object
        const user = parsed.user || parsed;
        console.log('=== User Data ===', user);
        console.log('=== Role ===', user.role);

        // Store in localStorage
        localStorage.setItem('token', parsed.token || '');
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', user.role || '');
        localStorage.setItem('userName', user.name || '');

        // Role-based redirect
        const role = (user.role || '').trim().toLowerCase();
        console.log('=== Redirecting to ===', role === 'admin' ? '/admin' : '/user');

        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Login error:', err);

        if (err.status === 0) {
          this.errorMessage = 'Cannot reach server. Make sure the backend is running.';
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (typeof err.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
    });
  }
}

