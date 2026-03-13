import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-manage-routes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-manage-routes.html',
  styleUrls: ['./admin-manage-routes.css']
})
export class AdminManageRoutes implements OnInit {

  apiUrl = 'https://localhost:7215/api/TravelRoutes';

  // =====================
  // SIGNALS
  // =====================
  routes = signal<any[]>([]);
  searchQuery = signal('');

  // Show / hide the add form
  showAddForm = false;

  // Edit mode tracking
  editingRouteId: number | null = null;

  // Reactive Form
  routeForm!: FormGroup;

  // Computed signal — filtered routes based on search
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

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
    this.getRoutes();
  }

  // =====================
  // INIT REACTIVE FORM
  // =====================
  initForm() {
    this.routeForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      travelType: ['', Validators.required]
    });
  }

  // =====================
  // GET ALL ROUTES
  // =====================
  getRoutes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.routes.set(data);
      },
      error: (err) => {
        console.error('Error fetching routes:', err);
        alert('Failed to load routes!');
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
  // OPEN ADD FORM
  // =====================
  openAddForm() {
    this.editingRouteId = null;
    this.routeForm.reset();
    this.showAddForm = true;
  }

  // =====================
  // CLOSE FORM
  // =====================
  closeForm() {
    this.showAddForm = false;
    this.editingRouteId = null;
    this.routeForm.reset();
  }

  // =====================
  // ADD ROUTE
  // =====================
  addRoute() {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    const routeData = this.routeForm.value;

    this.http.post(this.apiUrl, routeData).subscribe({
      next: () => {
        alert('Route Added Successfully!');
        this.getRoutes();
        this.closeForm();
      },
      error: (err) => {
        console.error('Error adding route:', err);
        alert('Failed to add route!');
      }
    });
  }

  // =====================
  // OPEN EDIT FORM
  // =====================
  openEdit(route: any) {
    this.editingRouteId = route.id;
    this.routeForm.patchValue({
      source: route.source,
      destination: route.destination,
      price: route.price,
      travelType: route.travelType
    });
    this.showAddForm = true;
  }

  // =====================
  // UPDATE ROUTE
  // =====================
  updateRoute() {
    if (this.routeForm.invalid) {
      this.routeForm.markAllAsTouched();
      return;
    }

    const routeData = this.routeForm.value;

    this.http.put(`${this.apiUrl}/${this.editingRouteId}`, routeData).subscribe({
      next: () => {
        alert('Route Updated Successfully!');
        this.getRoutes();
        this.closeForm();
      },
      error: (err) => {
        console.error('Error updating route:', err);
        alert('Failed to update route!');
      }
    });
  }

  // =====================
  // DELETE ROUTE
  // =====================
  deleteRoute(id: number) {
    if (confirm('Are you sure you want to delete this route?')) {
      this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).subscribe({
        next: () => {
          alert('Route Deleted Successfully!');
          this.getRoutes();
        },
        error: (err) => {
          console.error('Error deleting route:', err);
          alert('Failed to delete route!');
        }
      });
    }
  }

  // =====================
  // SUBMIT FORM (Add or Update)
  // =====================
  onSubmit() {
    if (this.editingRouteId) {
      this.updateRoute();
    } else {
      this.addRoute();
    }
  }
}
