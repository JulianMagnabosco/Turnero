import { Component } from '@angular/core';
import { Consult } from '../../models/consult';
import { FormsModule } from '@angular/forms';
import { ConsultsService } from '../../services/consults.service';

@Component({
  selector: 'app-consults-add',
  imports: [FormsModule],
  templateUrl: './consults-add.component.html',
  styleUrl: './consults-add.component.css'
})
export class ConsultsAddComponent {
  consult = new Consult("", "", (new Date()).toISOString());

  constructor(private service: ConsultsService) {}

  add(){
    this.service.addConsult(this.consult).subscribe({
      next:(value)=>{
        this.consult = new Consult("", this.consult.room, (new Date()).toISOString());
      },
      error:(err)=>{
        alert("Error al agregar la consulta");
      }
    })
  }
}
