import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomesComponent } from './incomes.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('IncomesComponent', () => {
  let component: IncomesComponent;
  let fixture: ComponentFixture<IncomesComponent>;
  let inventoryServiceMock: any;
  let authServiceMock: any;

  beforeEach(async () => {
    inventoryServiceMock = {
      getAllProducts: vi.fn().mockReturnValue(of([]))
    };
    
    authServiceMock = {
      currentUser: { roles: ['Administrador'] }
    };

    await TestBed.configureTestingModule({
      imports: [IncomesComponent, HttpClientTestingModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
