import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfitabilityComponent } from './profitability.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InventoryService } from '../../../core/services/inventory.service';
import { of } from 'rxjs';

describe('ProfitabilityComponent', () => {
  let component: ProfitabilityComponent;
  let fixture: ComponentFixture<ProfitabilityComponent>;
  let inventoryServiceMock: any;

  beforeEach(async () => {
    inventoryServiceMock = {
      getAllProducts: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [ProfitabilityComponent, HttpClientTestingModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfitabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
