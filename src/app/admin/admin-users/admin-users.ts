import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css']
})
export class AdminUsers implements OnInit {

  apiUrl = 'https://localhost:7215/api/User';

  // =====================
  // SIGNALS
  // =====================
  users = signal<any[]>([]);
  searchQuery = signal('');
  editUser: any = {};

  // Computed signal — filtered users based on search
  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.users();
    return this.users().filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  });

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getUsers();
  }

  // =====================
  // GET USERS
  // =====================
  getUsers() {
    this.http.get<any[]>(this.apiUrl).subscribe((data) => {
      this.users.set(data);
    });
  }

  // =====================
  // SEARCH
  // =====================
  onSearch(value: string) {
    this.searchQuery.set(value);
  }

  // =====================
  // OPEN EDIT
  // =====================
  openEdit(user: any) {
    this.editUser = { ...user };
  }

  // =====================
  // UPDATE USER
  // =====================
  updateUser() {
    this.http.put(`${this.apiUrl}/${this.editUser.id}`, this.editUser)
    .subscribe(() => {
      alert("User Updated");
      this.getUsers();
      this.editUser = {};
    });
  }

  // =====================
  // DELETE USER
  // =====================
  deleteUser(id: number) {
    if(confirm("Delete this user?")){
      this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe(() => {
        alert("User Deleted");
        this.getUsers();
      });
    }
  }

}