import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Category, Workshop, Artisan, InventoryBatch, TraceabilityEvent, Order } from '../models/san-roque.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Products
  getProducts(filter?: { categoryId?: string; workshopId?: string; search?: string }): Observable<Product[]> {
    let params = new HttpParams();
    if (filter?.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter?.workshopId) params = params.set('workshopId', filter.workshopId);
    if (filter?.search) params = params.set('search', filter.search);
    return this.http.get<Product[]>(`${this.baseUrl}/products`, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, data, { headers: this.getAuthHeaders() });
  }

  updateProduct(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${id}`, { headers: this.getAuthHeaders() });
  }

  // Categories & Workshops & Artisans
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  getWorkshops(): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(`${this.baseUrl}/workshops`);
  }

  getArtisans(): Observable<Artisan[]> {
    return this.http.get<Artisan[]>(`${this.baseUrl}/artisans`);
  }

  createWorkshop(data: Partial<Workshop>): Observable<Workshop> {
    return this.http.post<Workshop>(`${this.baseUrl}/workshops`, data, { headers: this.getAuthHeaders() });
  }

  createArtisan(data: Partial<Artisan>): Observable<Artisan> {
    return this.http.post<Artisan>(`${this.baseUrl}/artisans`, data, { headers: this.getAuthHeaders() });
  }

  // Traceability
  getTraceabilityByCode(code: string): Observable<InventoryBatch> {
    return this.http.get<InventoryBatch>(`${this.baseUrl}/traceability/code/${code}`);
  }

  getAllBatches(): Observable<InventoryBatch[]> {
    return this.http.get<InventoryBatch[]>(`${this.baseUrl}/traceability/batches`, { headers: this.getAuthHeaders() });
  }

  addTraceabilityEvent(batchId: string, eventData: Partial<TraceabilityEvent>): Observable<TraceabilityEvent> {
    return this.http.post<TraceabilityEvent>(`${this.baseUrl}/traceability/event/${batchId}`, eventData, { headers: this.getAuthHeaders() });
  }

  // Orders
  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, orderData);
  }

  trackOrder(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/track/${orderNumber}`);
  }

  getAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/orders/admin/all`, { headers: this.getAuthHeaders() });
  }

  updateOrderStatus(orderId: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/orders/admin/${orderId}/status`, { status }, { headers: this.getAuthHeaders() });
  }

  // File Upload
  uploadImage(file: File): Observable<{ filename: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string; url: string }>(`${this.baseUrl}/uploads/image`, formData, { headers: this.getAuthHeaders() });
  }
}
