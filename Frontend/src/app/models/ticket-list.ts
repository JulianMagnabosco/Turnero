import { Ticket } from "./ticket";

export class TicketList {
  id=0;
  tickets: Ticket[]=[]
  code=""
  name=""

  hasSelections=false

  constructor(tickets: Ticket[],code:string,name:string){
    this.tickets=tickets
    this.code=code
    this.name=name
  }
}
