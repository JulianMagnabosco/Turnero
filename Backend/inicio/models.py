from django.db import models
from asgiref.sync import sync_to_async
from django.contrib.auth.models import User

# Create your models here.
class Line(models.Model):
    name=models.CharField(max_length=1000)
    code=models.CharField(max_length=100)
    
    users = models.ManyToManyField(User)
    ticket_list=[]

    def json(self):
        return {"id":self.pk,"name":self.name,"code":self.code,"tickets":list(self.getTickets().values())}
    
    async def ajson(self):
        tks = Ticket.objects.filter(line=self)
        listA = await sync_to_async(tks.values)()
        newList = await sync_to_async(list)(listA)
        return {"id":self.pk,"name":self.name,"code":self.code,"tickets":newList}

    def getTickets(self):
        return Ticket.objects.filter(line=self).order_by("number")

    def __str__(self):
        return self.name+"("+self.code+")"
    
class Ticket(models.Model):
    number=models.IntegerField()
    line=models.ForeignKey(Line,on_delete=models.CASCADE,related_name="tickets")

    user=models.ForeignKey(User,blank=True,null=True,on_delete=models.SET_NULL,related_name="tickets")
    
    def json(self):
        if self.user:
            return {"id":self.pk,"code":self.line.code,"number":self.number,"user":self.user.username}
        else:
            return {"id":self.pk,"code":self.line.code,"number":self.number,"user":None}

    def __str__(self):
        return str(self.number)+"("+self.line.code+")"