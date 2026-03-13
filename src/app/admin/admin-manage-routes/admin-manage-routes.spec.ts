import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminManageRoutes } from './admin-manage-routes';

describe('AdminManageRoutes', () => {
  let component: AdminManageRoutes;
  let fixture: ComponentFixture<AdminManageRoutes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManageRoutes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminManageRoutes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
