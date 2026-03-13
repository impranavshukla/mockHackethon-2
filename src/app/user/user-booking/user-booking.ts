import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-booking.html',
  styleUrls: ['./user-booking.css']
})
export class UserBooking implements OnInit {

  routesApi = 'https://localhost:7215/api/TravelRoutes';
  bookingApi = 'https://localhost:7215/api/Booking';

  // =====================
  // SIGNALS
  // =====================
  routes = signal<any[]>([]);
  myBookings = signal<any[]>([]);
  searchQuery = signal('');

  // Active tab: 'routes' or 'bookings'
  activeTab: string = 'routes';

  // Logged-in user
  userId: number = 0;
  userName: string = '';

  // Filtered routes based on search
  filteredRoutes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.routes();
    return this.routes().filter(
      (r) =>
        r.source?.toLowerCase().includes(q) ||
        r.destination?.toLowerCase().includes(q) ||
        r.travelType?.toLowerCase().includes(q)
    );
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Get user info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id || 0;
    this.userName = user.name || '';

    this.getRoutes();
    this.getMyBookings();
  }

  // =====================
  // SWITCH TAB
  // =====================
  switchTab(tab: string) {
    this.activeTab = tab;
    this.searchQuery.set('');
  }

  // =====================
  // GET ALL ROUTES
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
  // SEARCH
  // =====================
  onSearch(value: string) {
    this.searchQuery.set(value);
  }

  // =====================
  // BOOK A ROUTE
  // =====================
  bookRoute(route: any, seats: number) {
    if (!seats || seats < 1) {
      alert('Please enter a valid number of seats!');
      return;
    }

    if (confirm(`Book ${seats} seat(s) from ${route.source} to ${route.destination} for ₹${route.price * seats}?`)) {
      const bookingData = {
        userId: this.userId,
        routeId: route.id,
        source: route.source,
        destination: route.destination,
        travelType: route.travelType,
        price: route.price,
        seats: Number(seats),
        status: 'Confirmed',
        bookingDate: new Date().toISOString()
      };

      this.http.post(this.bookingApi, bookingData, { responseType: 'text' }).subscribe({
        next: () => {
          alert('Booking Successful! 🎉');
          this.getMyBookings();
          this.activeTab = 'bookings';
        },
        error: (err) => {
          console.error('Error booking:', err);
          alert('Failed to book. Please try again!');
        }
      });
    }
  }

  // =====================
  // CANCEL BOOKING (Update status)
  // =====================
  cancelBooking(booking: any) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const updatedBooking = { ...booking, status: 'Cancelled' };

      this.http.put(`${this.bookingApi}/${booking.id}`, updatedBooking, { responseType: 'text' }).subscribe({
        next: () => {
          alert('Booking Cancelled!');
          this.getMyBookings();
        },
        error: (err) => {
          console.error('Error cancelling booking:', err);
          alert('Failed to cancel booking!');
        }
      });
    }
  }
}
