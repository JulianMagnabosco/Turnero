import { Injectable } from '@angular/core';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConsultsService {
  private baseWsUrl = 'ws://'+environment.apiUrl+"ws/consults/lobby/";
  private socket$: WebSocketSubject<any>;

  private baseUrl = 'http://'+environment.apiUrl+"api/";

  constructor(private http: HttpClient) {
    this.socket$ = webSocket(this.baseWsUrl);
  }

  // Send a message to the server
  sendMessage(message: any) {
    this.socket$.next(message);
  }

  // Receive messages from the server
  getMessages(): Observable<any> {
    return this.socket$.asObservable();
  }

  // Close the WebSocket connection
  closeConnection() {
    this.socket$.complete();
  }

  getConsults(): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'consults/');
  }

  addConsult(data: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + 'consult/', data);
  }
}
