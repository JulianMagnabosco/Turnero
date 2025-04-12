import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://'+environment.apiUrl + "api/";

  constructor(private client: HttpClient) {
  }

  get user():User|undefined{
    try {
      return JSON.parse( sessionStorage.getItem("app.user") || "");
    }catch (e) {
      return undefined
    }
  }

  setData(user:User){
    sessionStorage.setItem("app.user",JSON.stringify(user));
  }
  logout(){
    sessionStorage.setItem("app.user","");
  }
  login(data: any):Observable<any>{
    return this.client.post(this.baseUrl +"signin/", data, {withCredentials: true});
  }

  register(data: any):Observable<any>{
    return this.client.post(this.baseUrl + "signup/", data, {withCredentials: true});
  }

  testRegister(data: any):Observable<any>{
    return this.client.post(this.baseUrl + "test/register/", data);
  }

  requestChangePassword(email: any):Observable<any>{
    return this.client.post(this.baseUrl + "reset/req?email="+ email, null);
  }
  changePassword(data: any):Observable<any>{
    return this.client.post(this.baseUrl + "reset/", data);
  }
}
