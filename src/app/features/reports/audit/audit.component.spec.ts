import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditComponent } from './audit.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InventoryService } from '../../../core/services/inventory.service';
import { of } from 'rxjs';

describe('AuditComponent', () => {
  let component: AuditComponent;
  let fixture: ComponentFixture<AuditComponent>;
  let inventoryServiceMock: any;

  beforeEach(async () => {
    inventoryServiceMock = {
      getAllMovements: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [AuditComponent, HttpClientTestingModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load movements', () => {
    expect(component).toBeTruthy();
    expect(inventoryServiceMock.getAllMovements).toHaveBeenCalled();
  });
});
