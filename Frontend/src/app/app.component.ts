import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink,NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'Turnos';
  whatsappUrl=""

  dialogOpen=false;
  subs=new Subscription();

  types:{name:string,value:string}[]=[
    {name:"Perfumes Corporales",value:"CORPORAL"},
    {name:"Perfumes de Ambiente",value:"AMBIENTE"},
    {name:"Cosmética",value:"COSMETICA"},
  ]
  // listRoutes:{name:string,route:string}[]=[
  //   {name:"Catalogo",route:"/catalog"},
  //   {name:"Entrar",route:"/login"},
  //   {name:"Registrarse",route:"/register"},
  // ]
  constructor(protected service:AuthService, private router:Router){
    
  }
  ngOnInit(): void {
    this.router.events.subscribe(()=>{
      this.dialogOpen=false
    })
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }


  logout() {
    this.dialogOpen=false
    this.service.logout()
    this.router.navigate(["/home"])
  }
}
