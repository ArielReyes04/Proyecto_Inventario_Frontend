import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.component.html',
  styleUrls: []
})
export class AuditComponent implements OnInit {

  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef);
  
  movements: any[] = [];
  isLoading = true;
  expandedRow: string | null = null;

  ngOnInit() {
    this.loadMovements();
  }

  loadMovements() {
    this.isLoading = true;
    this.inventoryService.getAllMovements().subscribe({
      next: (data) => {
        // Ordenar por fecha descendente
        this.movements = data.sort((a, b) => new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime());
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching movements', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleDetails(id: string) {
    if (this.expandedRow === id) {
      this.expandedRow = null;
    } else {
      this.expandedRow = id;
    }
  }

  getMovementTypeClass(type: string): string {
    if (type.includes('INGRESO')) {
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    } else if (type.includes('EGRESO')) {
      return 'bg-rose-100 text-rose-800 border border-rose-200';
    }
    return 'bg-slate-100 text-slate-800';
  }

  formatType(type: string): string {
    return type.replace('_', ' ');
  }
}
