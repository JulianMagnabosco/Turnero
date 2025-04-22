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
    this.audio.loop=true
    this.charge();
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
        console.log(value)
        if(value["message"]["type"]=="update"){
          this.saveData(value["message"]["data"])
        }else if(value["message"]["type"]=="call"){
          this._callticket(value["message"])
        }
      },
      error: (err) => {
        alert(
          'Error inesperado en el servidor, revise su conexion a internet'
        );
      },
    }))
  }

  selectTicket(event:PointerEvent|MouseEvent,ticket:Ticket, line:TicketList){
    if(event.shiftKey){
      const firstItem = line.tickets.find((t)=>{return t.selected})
      console.log(firstItem)
      if (firstItem){
        const firstIndex = line.tickets.indexOf(firstItem)
        const secondIndex = line.tickets.indexOf(ticket)
        const startIndex = Math.min(firstIndex,secondIndex);
        const endIndex = Math.max(firstIndex,secondIndex);
        line.tickets.slice(startIndex,endIndex+1).forEach((v)=>{
          v.selected=true
        })
      }else{
        ticket.selected=true
      }
    }
    else{
      ticket.selected=!ticket.selected
    }
    

    line.hasSelections=!!line.tickets.find((t)=>{return t.selected})
  }

  
  
  deleteSelected(line:TicketList){
    let message = {
      "type": "dellist",
      "tickets": line.tickets.filter(t=>{return t.selected}).map(t=>{return {"id":t.id}})
    }
    line.hasSelections=false
    
    this.webSocket.sendMessage({"message":message});
  }

  callticket(line:TicketList) {
    let message = {
      "type": "call",
      "id": line.tickets[0].id,
      "number": line.tickets[0].number,
      "line": line.id
    }

    line.selectedTicket=line.tickets[0]
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.unsetSelected(line)
    },this.timer*1000)
    
    this.webSocket.sendMessage({"message":message});
  }
  _callticket(data: any) {
    this.list.forEach((l) => {
      if (l.id == data["line"]) {
        const ticket = new Ticket(data["number"])
        console.log(ticket)
        l.selectedTicket = ticket;
        this.audio.play();

        clearTimeout(this.timeout);
        setTimeout(() => {
          l.selectedTicket = undefined;
        }, this.timer * 1000);
        this.timeout = setTimeout(() => {
          this.audio.pause();
        }, this.timer * 1000);
        return
      }
    });
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
      line.tickets.map((t)=>{t.selected=false;return t})
      if(oldLine){
        oldLine.tickets=line.tickets
      }else{
        this.list.push(line)
      }
    })
  }
}
