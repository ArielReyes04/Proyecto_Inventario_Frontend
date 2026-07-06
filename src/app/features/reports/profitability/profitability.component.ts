import { Component, OnInit, ElementRef, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

Chart.register(...registerables);

@Component({
  selector: 'app-profitability',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profitability.component.html',
  styleUrls: []
})
export class ProfitabilityComponent implements OnInit {

  private inventoryService = inject(InventoryService);
  private cdr = inject(ChangeDetectorRef);
  
  products: any[] = [];
  isLoading = true;

  // Nuevas Métricas
  totalCapital: number = 0;
  projectedProfit: number = 0;
  averageMargin: number = 0;
  topProfitableProduct: any = null;
  criticalStockCapital: number = 0;

  @ViewChild('barChartCanvas', { static: false }) barChartCanvas!: ElementRef;
  @ViewChild('pieChartCanvas', { static: false }) pieChartCanvas!: ElementRef;
  
  barChart: any;
  pieChart: any;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.inventoryService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.calculateKpis();
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzamos vista para que los canvas existan
        
        // Renderizar gráficos un tick después para asegurar que el canvas esté en el DOM
        setTimeout(() => {
          this.renderCharts();
        }, 0);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateKpis() {
    this.totalCapital = this.products.reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0);
    const totalSalesValue = this.products.reduce((acc, p) => acc + (p.currentStock * p.salePrice), 0);
    this.projectedProfit = totalSalesValue - this.totalCapital;

    // Average Margin %
    if (this.totalCapital > 0) {
      this.averageMargin = (this.projectedProfit / this.totalCapital) * 100;
    }

    // Top Profitable Product (Highest margin per unit)
    if (this.products.length > 0) {
      this.topProfitableProduct = this.products.reduce((prev, current) => {
        const prevMargin = prev.salePrice - prev.costPrice;
        const currentMargin = current.salePrice - current.costPrice;
        return (prevMargin > currentMargin) ? prev : current;
      });
    }

    // Critical Stock Capital (products at or below minimum stock)
    this.criticalStockCapital = this.products
      .filter(p => p.currentStock <= p.minimumStock)
      .reduce((acc, p) => acc + (p.currentStock * p.costPrice), 0);
  }

  renderCharts() {
    if (!this.barChartCanvas || !this.pieChartCanvas) return;

    if (this.barChart) this.barChart.destroy();
    if (this.pieChart) this.pieChart.destroy();

    // Bar Chart (Top 5 Productos en Stock)
    const top5Stock = [...this.products]
      .sort((a, b) => b.currentStock - a.currentStock)
      .slice(0, 5);

    this.barChart = new Chart(this.barChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: top5Stock.map(p => p.name.substring(0, 15) + '...'),
        datasets: [
          {
            label: 'Costo Unit. ($)',
            data: top5Stock.map(p => p.costPrice),
            backgroundColor: 'rgba(148, 163, 184, 0.7)', // slate-400
            borderRadius: 4
          },
          {
            label: 'Venta Unit. ($)',
            data: top5Stock.map(p => p.salePrice),
            backgroundColor: 'rgba(99, 102, 241, 0.8)', // indigo-500
            borderRadius: 4
          }
        ]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Doughnut Chart (Capital Distribution por Producto - top 4 y el resto)
    const sortedByCapital = [...this.products]
      .map(p => ({ name: p.name, capital: p.currentStock * p.costPrice }))
      .sort((a, b) => b.capital - a.capital);
    
    const top4Capital = sortedByCapital.slice(0, 4);
    const restCapital = sortedByCapital.slice(4).reduce((acc, curr) => acc + curr.capital, 0);
    
    const pieLabels = top4Capital.map(p => p.name);
    const pieData = top4Capital.map(p => p.capital);
    if (restCapital > 0) {
      pieLabels.push('Otros (Combinados)');
      pieData.push(restCapital);
    }

    this.pieChart = new Chart(this.pieChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: pieLabels,
        datasets: [{
          data: pieData,
          backgroundColor: [
            '#6366f1', // indigo-500
            '#0ea5e9', // sky-500
            '#10b981', // emerald-500
            '#f59e0b', // amber-500
            '#94a3b8'  // slate-400
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  // ==== EXPORTADORES ====

  exportToPDF() {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Reporte de Rentabilidad', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Resumen Ejecutivo
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Resumen Ejecutivo', 14, 42);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Capital Invertido: $${this.totalCapital.toFixed(2)}`, 14, 50);
    doc.text(`Ganancia Proyectada: $${this.projectedProfit.toFixed(2)}`, 14, 56);
    doc.text(`Rentabilidad Promedio: ${this.averageMargin.toFixed(2)}%`, 14, 62);
    
    if (this.topProfitableProduct) {
      const bestMargin = this.topProfitableProduct.salePrice - this.topProfitableProduct.costPrice;
      doc.text(`Mejor Producto: ${this.topProfitableProduct.name} (Margen: $${bestMargin.toFixed(2)})`, 100, 50);
    }
    doc.text(`Capital en Riesgo (Stock Bajo): $${this.criticalStockCapital.toFixed(2)}`, 100, 56);

    // Tabla de Datos
    const tableData = this.products.map(p => [
      p.sku,
      p.name,
      p.currentStock.toString(),
      `$${p.costPrice.toFixed(2)}`,
      `$${p.salePrice.toFixed(2)}`,
      `$${(p.currentStock * p.costPrice).toFixed(2)}`,
      `$${(p.currentStock * (p.salePrice - p.costPrice)).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 72,
      head: [['SKU', 'Producto', 'Stock', 'Costo', 'Venta', 'Capital Inv.', 'Ganan. Proy.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], textColor: [255,255,255] }, // indigo-500
      alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      styles: { fontSize: 9 }
    });

    doc.save(`Reporte_Rentabilidad_${new Date().getTime()}.pdf`);
  }

  exportToExcel() {
    const excelData = this.products.map(p => ({
      'Código SKU': p.sku,
      'Nombre del Producto': p.name,
      'Categoría': p.category?.name || 'General',
      'Stock Actual': p.currentStock,
      'Stock Mínimo': p.minimumStock,
      'Costo Unitario ($)': p.costPrice,
      'Precio Venta ($)': p.salePrice,
      'Margen Unitario ($)': p.salePrice - p.costPrice,
      'Capital Invertido ($)': p.currentStock * p.costPrice,
      'Ganancia Proyectada ($)': p.currentStock * (p.salePrice - p.costPrice)
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-ajustar ancho de columnas
    const wscols = [
      {wch: 15}, {wch: 35}, {wch: 20}, {wch: 12}, {wch: 12}, {wch: 16}, {wch: 16}, {wch: 18}, {wch: 22}, {wch: 22}
    ];
    ws['!cols'] = wscols;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rentabilidad');
    
    XLSX.writeFile(wb, `Reporte_Rentabilidad_${new Date().getTime()}.xlsx`);
  }
}
