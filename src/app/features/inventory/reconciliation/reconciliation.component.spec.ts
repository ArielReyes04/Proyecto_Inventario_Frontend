import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReconciliationComponent } from './reconciliation.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('ReconciliationComponent', () => {
  let component: ReconciliationComponent;
  let fixture: ComponentFixture<ReconciliationComponent>;
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
      imports: [ReconciliationComponent, HttpClientTestingModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReconciliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
