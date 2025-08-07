from django.db import models
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User

# Create your models here.
class Line(models.Model):
    name=models.CharField(max_length=1000)
    code=models.CharField(max_length=100)
    
    users = models.ManyToManyField(User,blank=True)
    ticket_list=[]

    def json(self):
        return {"id":self.pk,"name":self.name,"code":self.code,"tickets":list(self.getTickets().values())}
    
    async def ajson(self):
        tks = Ticket.objects.filter(line=self).filter(called=False).order_by("number")
        listA = await sync_to_async(tks.values)()
        newList = await sync_to_async(list)(listA)
        return {"id":self.pk,"name":self.name,"code":self.code,"tickets":newList}

    def getTickets(self):
        return Ticket.objects.filter(line=self).filter(called=False).order_by("number")

    def __str__(self):
        return self.name+"("+self.code+")"
    
class Ticket(models.Model):
    number=models.IntegerField()
    line=models.ForeignKey(Line,on_delete=models.CASCADE,related_name="tickets")
    totem=models.CharField(max_length=100,default="")
    called=models.BooleanField(default=False)

    user=models.ForeignKey(User,blank=True,null=True,on_delete=models.SET_NULL,related_name="tickets")
    
    def json(self):
        return {"id":self.pk,
                "code":self.line.code,
                "number":self.number,
                "totem":self.totem,
                "called":self.called,
                "user":self.user.username if self.user else None}
        
    async def ajson(self):
        ticketLine = await sync_to_async(self.line)()
        ticketUser = await sync_to_async(self.user)()
        return {"id":self.pk,
                "code":ticketLine.code,
                "number":self.number,
                "totem":self.totem,
                "called":self.called,
                "user":ticketUser.username if self.user else None}

    def __str__(self):
        return str(self.number)+"("+self.line.code+")"
        
class Consult(models.Model):
    patient=models.CharField(max_length=200,default="")
    room=models.CharField(max_length=100,default="")
    date = models.DateTimeField(auto_now_add=True)
    
    def json(self):
        return {"id":self.pk,
                "patient":self.patient,
                "room":self.room,
                "date":self.date.isoformat(),}
        
    async def ajson(self):
        return {"id":self.pk,
                "patient":self.patient,
                "room":self.room,
                "date":self.date.isoformat(),}

    def __str__(self):
        return str(self.patient)+"(room_"+self.room+") "+self.date.isoformat()