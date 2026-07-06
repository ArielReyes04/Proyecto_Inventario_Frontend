import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrls: []
})
export class AlertsComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef);
  
  alertProducts: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        // Filtrar productos críticos
        this.alertProducts = data.filter(p => p.currentStock <= p.minimumStock);
        // Ordenar primero los que tienen 0 stock
        this.alertProducts.sort((a, b) => a.currentStock - b.currentStock);
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar actualización de la vista
      },
      error: (err) => {
        console.error('Error cargando alertas', err);
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar actualización de la vista incluso en error
      }
    });
  }
}
