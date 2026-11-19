import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/pages/client.model';

@Injectable({ providedIn: 'root' })
export class ClientStoreService {
  private apiUrl = 'http://localhost:5185/api/clientes';
  clients: Client[] = [];

  constructor(private http: HttpClient) {}

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createClient(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateClient(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  setClients(clients: Client[]): void {
    this.clients = clients;
  }
}