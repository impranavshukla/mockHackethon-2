import { Routes } from '@angular/router';
import { Login } from './shared/login/login';
import { Signup } from './shared/signup/signup';
import { UserLayout } from './layout/user-layout/user-layout';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { UserHome } from './user/user-home/user-home';
import { UserProfile } from './user/user-profile/user-profile';
import { AdminHome } from './admin/admin-home/admin-home';
import { AdminProfile } from './admin/admin-profile/admin-profile';
import { AdminUsers } from './admin/admin-users/admin-users';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },

  // User layout routes
  {
    path: 'user',
    component: UserLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: UserHome },
      { path: 'dashboard', component: UserHome },
      { path: 'profile', component: UserProfile },
    ],
  },

  // Admin layout routes
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AdminHome },
      { path: 'dashboard', component: AdminHome },
      { path: 'profile', component: AdminProfile },
      { path: 'users', component: AdminUsers },
    ],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
