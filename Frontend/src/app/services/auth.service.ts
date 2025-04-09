import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = environment.apiUrl + "/api/auth/";

  constructor(private client: HttpClient) {
  }

  get user():User|undefined{
    try {
      return JSON.parse( sessionStorage.getItem("app.user") || "");
    }catch (e) {
      return undefined
    }
  }

  setData(user:User,token:string){
    sessionStorage.setItem("app.user",JSON.stringify(user));
    sessionStorage.setItem("app.token",token);
  }
  logout(){
    sessionStorage.setItem("app.user","");
    sessionStorage.setItem("app.token","");
  }
  login(data: any):Observable<any>{
    return this.client.post(this.baseUrl +"login", data);
  }

  registerUser(data: any):Observable<any>{
    return this.client.post(this.baseUrl + "register", data);
  }

  testRegisterUser(data: any):Observable<any>{
    return this.client.post(this.baseUrl + "test/register", data);
  }

  requestChangePassword(email: any):Observable<any>{
    return this.client.post(this.baseUrl + "reset/req?email="+ email, null);
  }
  changePassword(data: any):Observable<any>{
    return this.client.post(this.baseUrl + "reset", data);
  }
}
