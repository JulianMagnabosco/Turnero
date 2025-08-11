import { Component, OnInit } from '@angular/core';
import { Consult } from '../../models/consult';
import { FormsModule } from '@angular/forms';
import { ConsultsService } from '../../services/consults.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-consults-add',
  imports: [FormsModule],
  templateUrl: './consults-add.component.html',
  styleUrl: './consults-add.component.css'
})
export class ConsultsAddComponent implements OnInit {
  consult = new Consult("", "", (new Date()).toISOString());

  constructor(private service: ConsultsService, private route:ActivatedRoute, private router:Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['room']) {
        this.consult.room = params['room'].trim().toLowerCase();
      }
    });
    
  }

  addConsult(){
    this.consult.patient = this.consult.patient.trim().toLowerCase();
    this.consult.room = this.consult.room.trim().toLowerCase();


    this.service.addConsult(this.consult).subscribe({
      next:(value)=>{
        this.consult = new Consult("", this.consult.room, (new Date()).toISOString());
        alert("Consulta agregada correctamente");
        this.router.navigate(['/consults'], {
          queryParams: { room: this.consult.room }
        });
      },
      error:(err)=>{
        alert("Error al agregar la consulta");
      }
    })
  }
}
