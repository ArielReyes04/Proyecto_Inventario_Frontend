import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: []
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef);

  alertProducts: any[] = [];
  isLoadingAlerts = true;

  ngOnInit() {
    this.loadAlerts();
  }

  get userRole(): string {
    return this.authService.currentUser?.roles?.[0] || 'Desconocido';
  }

  get isAdmin(): boolean {
    return this.userRole.toLowerCase() === 'administrador';
  }

  get isVendedor(): boolean {
    return this.userRole.toLowerCase() === 'vendedor';
  }

  get isBodeguero(): boolean {
    return this.userRole.toLowerCase() === 'encargado de bodega';
  }

  loadAlerts() {
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        // Filtrar productos críticos
        this.alertProducts = data.filter(p => p.currentStock <= p.minimumStock);
        // Ordenar primero los que tienen 0 stock (más críticos)
        this.alertProducts.sort((a, b) => a.currentStock - b.currentStock);
        this.isLoadingAlerts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando alertas para el dashboard', err);
        this.isLoadingAlerts = false;
        this.cdr.detectChanges();
      }
    });
  }
}
