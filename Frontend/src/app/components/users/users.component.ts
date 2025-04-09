import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgIf,NgFor,FormsModule,NgClass],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit,OnDestroy{

  text:string="";

  products:User[]=new Array(12).fill(new User);

  pages=22
  elements=21
  actualpage=0

  elementsPerPage=200
  paginationDist=2;

  subs:Subscription=new Subscription;

  constructor(private activatedRoute:ActivatedRoute, private router:Router, private service:UserService ){
  }
  
  ngOnInit(): void {

    this.subs.add(
      this.activatedRoute.queryParams.subscribe({
        next: value => {
          this.text=value["text"]||""
          this.actualpage=value["page"]||0
          this.search()
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


  charge(page:number=0){
    this.actualpage=page
    let data = {
      "text": this.text,
    }


    var newParams: {[k: string]: any} = {};
    if( data.text != "") newParams["text"] = data.text
    newParams["page"] = this.actualpage


    this.router.navigate([],{
      relativeTo: this.activatedRoute,
      queryParams: newParams as Params
    })

  }

  search(){
    let data = {
      "text": this.text,
      "page": this.actualpage,
      "size": this.elementsPerPage
    }
    
    this.subs.add(
      this.service.getAll(data).subscribe(
        {
          next: value => {
            this.pages=value["pages"]
            this.products=value["list"]
            this.elements=value["elements"]
          },
          error: err => {
            alert("Error inesperado en el servidor, revise su conexion a internet");
          }
        }
      )
    );
  }


  deleteUser(id:number){
    if(confirm("¿Eliminar producto?")){
      this.subs.add(
        this.service.delete(id.toString()).subscribe({
          next: value => {
            alert("Eliminado");
            // alert("Añadido al carrito");
            this.search()
          },
          error:err => {
            // alert("Hubo un error al añadir al carrito");
            if(err.status == 403 || err.status == 401){
              return
            }
            alert("Error inesperado en el servidor, revise su conexion a internet");
          }
        })
      )
    
    }
  }


}


