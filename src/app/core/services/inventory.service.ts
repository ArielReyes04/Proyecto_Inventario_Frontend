import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==========================================
  // PRODUCTOS Y CACHE OFFLINE
  // ==========================================

  private readonly CACHE_KEY = 'kanos_products_cache';

  /**
   * Obtiene todos los productos. Si el backend responde exitosamente,
   * guarda una copia en caché. Si el backend o la red fallan, 
   * devuelve la copia almacenada localmente (Modo Offline Degradado).
   */
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/products`).pipe(
      tap(products => {
        // Guardamos en caché exitosamente
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(products));
      }),
      catchError(error => {
        console.warn('⚠️ Backend inaccesible. Entrando en Modo Offline Degradado.');
        const cachedData = localStorage.getItem(this.CACHE_KEY);
        if (cachedData) {
          // Devolvemos el array cacheado envuelto en un Observable
          return of(JSON.parse(cachedData));
        }
        // Si no hay caché y falla la red, propagamos el error
        throw error;
      })
    );
  }

  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/products/${id}`);
  }

  createProduct(productData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/products`, productData).pipe(
      tap(() => localStorage.removeItem(this.CACHE_KEY)) // Invalidar caché
    );
  }

  updateProduct(id: string, productData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/api/products/${id}`, productData).pipe(
      tap(() => localStorage.removeItem(this.CACHE_KEY)) // Invalidar caché
    );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/products/${id}`).pipe(
      tap(() => localStorage.removeItem(this.CACHE_KEY)) // Invalidar caché
    );
  }

  toggleProductStatus(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/api/products/${id}/toggle-active`, {}).pipe(
      tap(() => localStorage.removeItem(this.CACHE_KEY)) // Invalidar caché
    );
  }

  // ==========================================
  // MOVIMIENTOS DE INVENTARIO
  // ==========================================

  /**
   * Registra un nuevo movimiento de inventario (Ingreso o Egreso).
   * @param movementData Payload complejo con cabecera y lista de detalles.
   */
  registerMovement(movementData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/inventory-movements`, movementData);
  }

  // ==========================================
  // CATEGORÍAS
  // ==========================================

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/categories`);
  }

  // ==========================================
  // AUDITORÍA / HISTÓRICO
  // ==========================================

  getAllMovements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/inventory-movements`);
  }
}
