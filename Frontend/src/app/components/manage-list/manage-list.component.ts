import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketList } from '../../models/ticket-list';
import { TicketsService } from '../../services/tickets.service';
import { Ticket } from '../../models/ticket';
import { NgFor } from '@angular/common';
import { WebSocketService } from '../../services/web-socket.service';


@Component({
  selector: 'app-manage-list',
  imports: [NgFor],
  templateUrl: './manage-list.component.html',
  styleUrl: './manage-list.component.css'
})
export class ManageListComponent  implements OnInit,OnDestroy {
  subs: Subscription = new Subscription();
  loading=false
  list: TicketList[] = [
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"CO","CO"),
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"P","Pediatria"),
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"C","Clinica"),
  ];
  audio = new Audio('music.wav');

  timeout:any;
  timer=5

  constructor(private service:TicketsService, private webSocket:WebSocketService) {
  }
  ngOnInit(): void {
    this.charge();
    this.audio.loop=true
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  
  charge() {
    this.loading=true
    this.subs.add(
      this.service.getAll().subscribe({
        next: (value) => {
          this.saveData(value["data"])
        },
        error: (err) => {
          alert(
            'Error inesperado en el servidor, revise su conexion a internet'
          );
        },
        complete: ()=>{
          this.loading=false
        }
      })
    );

    
    this.subs.add(
      this.webSocket.getMessages().subscribe({
      next: (value) => {
        console.log(value["message"]["type"])
        if(value["message"]["type"]=="update"){
          this.saveData(value["message"]["data"])
        }else if(value["message"]["type"]=="call"){
          this.playSound()
        }
      },
      error: (err) => {
        alert(
          'Error inesperado en el servidor, revise su conexion a internet'
        );
      },
    }))
  }

  callticket(line:TicketList) {
    let message = {
      "type": "call",
      "id": line.tickets[0].id
    }

    line.selectedTicket=line.tickets[0]
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.unsetSelected(line)
    },this.timer*1000)
    
    this.webSocket.sendMessage({"message":message});
  }

  addticket(code:string) {
    let message = {
      "type": "add",
      "code": code
    }
    
    this.webSocket.sendMessage({"message":message});
  }

  deleteTicket(id:number){
    let message = {
      "type": "del",
      "id": id
    }
    
    this.webSocket.sendMessage({"message":message});
  }

  playSound(){
    this.audio.play();
  }
  
  unsetSelected(line:TicketList){
    line.selectedTicket=undefined
    this.audio.pause();
  }

  saveData(data:any){
    let newList: TicketList[] = data
    newList.forEach((line)=>{
      let oldLine = this.list.find((e)=>{return e.code==line.code})
      if(oldLine){
        oldLine.tickets=line.tickets
      }else{
        this.list.push(line)
      }
    })
  }
}
