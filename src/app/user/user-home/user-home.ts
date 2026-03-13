import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-home.html',
  styleUrls: ['./user-home.css']
})
export class UserHome implements OnInit {

  bookingApi = 'https://localhost:7215/api/Booking';
  routesApi = 'https://localhost:7215/api/TravelRoutes';

  // =====================
  // USER INFO
  // =====================
  userName: string = '';
  userId: number = 0;

  // =====================
  // SIGNALS
  // =====================
  myBookings = signal<any[]>([]);
  routes = signal<any[]>([]);

  // Computed stats
  totalBookings = computed(() => this.myBookings().length);
  confirmedBookings = computed(() => this.myBookings().filter(b => b.status === 'Confirmed').length);
  cancelledBookings = computed(() => this.myBookings().filter(b => b.status === 'Cancelled').length);

  // Recent bookings (last 5)
  recentBookings = computed(() => {
    return [...this.myBookings()]
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 5);
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userName = user.name || 'User';
    this.userId = user.id || 0;

    this.getMyBookings();
    this.getRoutes();
  }

  // =====================
  // GET MY BOOKINGS
  // =====================
  getMyBookings() {
    if (!this.userId) return;
    this.http.get<any[]>(`${this.bookingApi}/user/${this.userId}`).subscribe({
      next: (data) => {
        this.myBookings.set(data);
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
      }
    });
  }

  // =====================
  // GET ROUTES
  // =====================
  getRoutes() {
    this.http.get<any[]>(this.routesApi).subscribe({
      next: (data) => {
        this.routes.set(data);
      },
      error: (err) => {
        console.error('Error fetching routes:', err);
      }
    });
  }
}
