import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription,timer } from 'rxjs';
import { TicketList } from '../../models/ticket-list';
import { TicketsService } from '../../services/tickets.service';
import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Ticket } from '../../models/ticket';
import { WebSocketService } from '../../services/web-socket.service';

@Component({
  selector: 'app-display-list',
  imports: [NgFor,DatePipe],
  templateUrl: './display-list.component.html',
  styleUrl: './display-list.component.css',
})
export class DisplayListComponent implements OnInit, OnDestroy {
  subs: Subscription = new Subscription();
  loading = false;

  calledList:Ticket[]=[];
  list: Ticket[] = [
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"CO","CO"),
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"P","Pediatria"),
    // new TicketList([new Ticket(),new Ticket(),new Ticket()],"C","Clinica"),
  ];
  audio = new Audio('music.wav');
  audioPaused=true

  timeout: any;
  soundTimer = 4;
  removalTimer = 8;

  datetime=new Date();
  constructor(
    private service: TicketsService,
    private webSocket: WebSocketService
  ) {}
  ngOnInit(): void {
    this.audio.loop=true
    this.charge();
  }

  ngOnDestroy(): void {

    this.subs.unsubscribe();
  }
  charge() {
    this.subs.add(timer(0,1000).subscribe({
      next: (value)=>{
        this.datetime=new Date()
      }
    }))
    this.loading = true;
    this.subs.add(
      this.service.getAll().subscribe({
        next: (value) => {
          this.list = value['data'];
        },
        error: (err) => {
          console.error("Reintentando")
        },
        complete: () => {
          this.loading = false;
        },
      })
    );

    this.subs.add(
      this.webSocket.getMessages().subscribe({
        next: (value) => {
          console.log(value)
          if (value['message']['type'] == 'update') {
            this.saveData(value['message']['data']);
          } else if (value['message']['type'] == 'call') {
            this._callticket(value['message']);
          }
        },
        error: (err) => {
          console.error("Reintentando")
          this.charge()
        },
      })
    );
  }

  _callticket(data: any) {
    let ticket=this.calledList.find((t)=>{return t.user==data['user']})
    let ticketid=0
    if(ticket){
      ticket.number=data['number']
      ticket.code=data['code']
      ticketid=this.calledList.indexOf(ticket)
    }
    else{
      ticketid=this.calledList.push(new Ticket(data['code'],data['number'],data['user']))-1
    }
    this.playSound();
    
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.stopSound();
    }, this.soundTimer * 1000);
  }

  playSound(){
    try{
      this.audio.play();
      this.audioPaused=false
    }catch{
      console.error("Error de audio")
    }
  }
  stopSound(){
    try{
      this.audio.pause();
      this.audioPaused=true
    }catch{
      console.error("Error de audio")
    }
  }

  saveData(data: any) {
    let newList: Ticket[] = data;
    newList.forEach((ticket) => {
      let findTicket = this.list.find((e) => {
        return e.id == ticket.id;
      });
      if(findTicket){
        ticket.selected=findTicket.selected
      }
    });
    this.list=newList;
  }
}
