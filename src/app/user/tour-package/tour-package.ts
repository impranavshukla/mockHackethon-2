import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ITourPackage {
  id: number;
  packageName: string;
  destination: string;
  durationDays: number;
  price: number;
  description: string;
  imageUrl: string;
}

interface PackageBooking {
  id?: number;
  userId: number;
  packageId: number;
  packageName?: string;
  destination?: string;
  price?: number;
  peopleCount: number;
  status: string;
  bookingDate: Date;
}

@Component({
  selector: 'app-tour-package',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tour-package.html',
  styleUrl: './tour-package.css',
})
export class TourPackage implements OnInit {
  packages: ITourPackage[] = [];
  filteredPackages: ITourPackage[] = [];
  selectedPackage: ITourPackage | null = null;
  userId: number | null = null;
  
  // Booking Form
  peopleCount: number = 1;
  isBookingModalOpen: boolean = false;
  bookingSuccess: boolean = false;
  bookingError: string | null = null;

  searchTerm: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPackages();
    this.loadUser();
  }

  loadUser() {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userId = user.id;
    }
  }

  fetchPackages() {
    this.http.get<ITourPackage[]>('https://localhost:7215/api/TourPackages').subscribe({
      next: (data) => {
        this.packages = data;
        this.filteredPackages = data;
      },
      error: (err) => console.error('Error fetching packages', err)
    });
  }

  filterPackages() {
    this.filteredPackages = this.packages.filter(pkg => 
      pkg.packageName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      pkg.destination.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openBookingModal(pkg: ITourPackage) {
    this.selectedPackage = pkg;
    this.peopleCount = 1;
    this.isBookingModalOpen = true;
    this.bookingSuccess = false;
    this.bookingError = null;
  }

  closeModal() {
    this.isBookingModalOpen = false;
    this.selectedPackage = null;
  }

  confirmBooking() {
    if (!this.userId) {
      this.bookingError = 'Please login to book a package';
      return;
    }

    if (!this.selectedPackage) return;

    const bookingData: PackageBooking = {
      userId: this.userId,
      packageId: this.selectedPackage.id,
      packageName: this.selectedPackage.packageName,
      destination: this.selectedPackage.destination,
      price: this.selectedPackage.price * this.peopleCount,
      peopleCount: this.peopleCount,
      status: 'Confirmed',
      bookingDate: new Date()
    };

    this.http.post('https://localhost:7215/api/PackageBooking', bookingData).subscribe({
      next: () => {
        this.bookingSuccess = true;
        setTimeout(() => this.closeModal(), 2000);
      },
      error: (err) => {
        console.error('Booking failed', err);
        this.bookingError = 'Failed to book the package. Please try again.';
      }
    });
  }
}

