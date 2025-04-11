import { Ticket } from "./ticket";

export class TicketList {
  id=0;
  list: Ticket[]=[]
  code=""
  name=""

  constructor(list: Ticket[],code:string,name:string){
    this.list=list
    this.code=code
    this.name=name
  }
}
