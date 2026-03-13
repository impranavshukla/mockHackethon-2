import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-home.html',
  styleUrls: ['./admin-home.css']
})
export class AdminHome implements OnInit {

  bookingApi = 'https://localhost:7215/api/Booking';
  routesApi = 'https://localhost:7215/api/TravelRoutes';
  usersApi = 'https://localhost:7215/api/User';

  // =====================
  // SIGNALS
  // =====================
  allBookings = signal<any[]>([]);
  allRoutes = signal<any[]>([]);
  allUsers = signal<any[]>([]);

  // Computed Stats
  totalBookings = computed(() => this.allBookings().length);
  confirmedBookings = computed(() => this.allBookings().filter(b => b.status === 'Confirmed').length);
  cancelledBookings = computed(() => this.allBookings().filter(b => b.status === 'Cancelled').length);
  totalRoutes = computed(() => this.allRoutes().length);
  totalUsers = computed(() => this.allUsers().length);

  // Total revenue from confirmed bookings
  totalRevenue = computed(() => {
    return this.allBookings()
      .filter(b => b.status === 'Confirmed')
      .reduce((sum, b) => sum + (b.price || 0), 0);
  });

  // Recent bookings (last 5)
  recentBookings = computed(() => {
    return [...this.allBookings()]
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
      .slice(0, 5);
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getBookings();
    this.getRoutes();
    this.getUsers();
  }

  // =====================
  // FETCH DATA
  // =====================
  getBookings() {
    this.http.get<any[]>(this.bookingApi).subscribe({
      next: (data) => this.allBookings.set(data),
      error: (err) => console.error('Error fetching bookings:', err)
    });
  }

  getRoutes() {
    this.http.get<any[]>(this.routesApi).subscribe({
      next: (data) => this.allRoutes.set(data),
      error: (err) => console.error('Error fetching routes:', err)
    });
  }

  getUsers() {
    this.http.get<any[]>(this.usersApi).subscribe({
      next: (data) => this.allUsers.set(data),
      error: (err) => console.error('Error fetching users:', err)
    });
  }
}
