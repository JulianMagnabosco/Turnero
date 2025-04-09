import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiUrl+"/api/user";

  constructor(private http: HttpClient) {
  }

  getAll(data:any):Observable<any>{
    return this.http.get(this.baseUrl+"/list",{params:data});
  }
  get(id:string):Observable<any>{
    return this.http.get(this.baseUrl+"/"+id);
  }
  role(id:string,data:any):Observable<any>{
    return this.http.put(this.baseUrl+"/role/"+id,data);
  }
  delete(id:string):Observable<any>{
    return this.http.delete(this.baseUrl+"/delete/"+id);
  }
}
