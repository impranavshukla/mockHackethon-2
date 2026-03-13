import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bookings.html',
  styleUrls: ['./admin-bookings.css']
})
export class AdminBookings implements OnInit {

  apiUrl = 'https://localhost:7215/api/Booking';

  // =====================
  // SIGNALS
  // =====================
  bookings = signal<any[]>([]);
  searchQuery = signal('');

  // Computed signal — filtered bookings based on search
  filteredBookings = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.bookings();
    return this.bookings().filter(
      (b) =>
        String(b.id).includes(q) ||
        String(b.userId).includes(q) ||
        String(b.routeId).includes(q) ||
        b.source?.toLowerCase().includes(q) ||
        b.destination?.toLowerCase().includes(q) ||
        b.travelType?.toLowerCase().includes(q) ||
        b.status?.toLowerCase().includes(q) ||
        String(b.seats).includes(q)
    );
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getBookings();
  }

  // =====================
  // GET ALL BOOKINGS
  // =====================
  getBookings() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.bookings.set(data);
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        alert('Failed to load bookings!');
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
  // CANCEL BOOKING (Update status)
  // =====================
  cancelBooking(booking: any) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const updatedBooking = { ...booking, status: 'Cancelled' };

      this.http.put(`${this.apiUrl}/${booking.id}`, updatedBooking, { responseType: 'text' }).subscribe({
        next: () => {
          alert('Booking Cancelled Successfully!');
          this.getBookings();
        },
        error: (err) => {
          console.error('Error cancelling booking:', err);
          alert('Failed to cancel booking!');
        }
      });
    }
  }
}
