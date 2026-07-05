import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsComponent } from './products.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InventoryService } from '../../../core/services/inventory.service';
import { of } from 'rxjs';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let inventoryServiceMock: any;

  beforeEach(async () => {
    inventoryServiceMock = {
      getAllProducts: vi.fn().mockReturnValue(of([])),
      getCategories: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [ProductsComponent, HttpClientTestingModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load products on init', () => {
    expect(component).toBeTruthy();
    expect(inventoryServiceMock.getAllProducts).toHaveBeenCalled();
    expect(inventoryServiceMock.getCategories).toHaveBeenCalled();
  });
});
