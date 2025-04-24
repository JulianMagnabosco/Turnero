import json

from channels.generic.websocket import AsyncWebsocketConsumer
from django.shortcuts import aget_object_or_404
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer

from .models import Line,Ticket

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        # print(self.scope)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        
        if message["type"]=="add" :
            line = await aget_object_or_404(Line,code=message["code"])
            list = Ticket.objects.filter(line=line)

            last = await sync_to_async(list.last)()
            lastNumber = last.number+1 if not last is None else 1
            await Ticket.asave(Ticket(number=lastNumber,line=line))
            
        elif message["type"]=="call" or message["type"]=="del":
            ticket = await aget_object_or_404(Ticket,pk=message["id"])
            await Ticket.adelete(ticket)

        elif message["type"]=="dellist" :
            for t in message["tickets"]:
                ticket = await aget_object_or_404(Ticket,pk=t["id"])
                await Ticket.adelete(ticket)

        await self.getAll()

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message}
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))
        
    async def getAll(self):
    # if not request.user.is_authenticated:
    #     return JsonResponse({"login": False},status=401)
        username = self.scope["user"].username
        listRaw0 = Ticket.objects.select_related("user").select_related("line") 
        listRaw = listRaw0.filter(line__users__username=username).all() 

        listValues=list()
        async for t in listRaw:
            listValues.append(t.json())

        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", 
            "message": {
                "data": listValues,
                "type": "update"
            }
        })