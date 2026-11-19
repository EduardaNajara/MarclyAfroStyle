import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRecord } from '../models/pages/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersStoreService {
  private apiUrl = 'http://localhost:5185/api/pedidos';
  orders: OrderRecord[] = [];

  constructor(private http: HttpClient) {}

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateOrder(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  updateOrderStatus(id: number, statusAtual: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { statusAtual });
  }

  addOrderNote(id: number, payload: { tipoTag: string; textoComentario: string; idUsuario?: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/anotacoes`, payload);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setOrders(orders: OrderRecord[]): void {
    this.orders = orders;
  }
}