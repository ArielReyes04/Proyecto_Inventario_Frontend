import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickSearchComponent } from './quick-search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InventoryService } from '../../core/services/inventory.service';
import { of } from 'rxjs';

describe('QuickSearchComponent', () => {
  let component: QuickSearchComponent;
  let fixture: ComponentFixture<QuickSearchComponent>;
  let inventoryServiceMock: any;

  beforeEach(async () => {
    inventoryServiceMock = {
      getAllProducts: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [QuickSearchComponent, HttpClientTestingModule],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
