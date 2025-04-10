from django.db import models

# Create your models here.
class Line(models.Model):
    name=models.CharField(max_length=1000)
    code=models.CharField(max_length=100)
    ticket_list=[]

    def json(self):
        return {"id":self.pk,"name":self.name,"code":self.code,"tickets":list(self.getTickets().values())}

    def getTickets(self):
        return Ticket.objects.filter(line=self)

    def __str__(self):
        return self.name+"("+self.code+")"
    
class Ticket(models.Model):
    number=models.IntegerField()
    line=models.ForeignKey(Line,on_delete=models.CASCADE,related_name="tickets")

    def __str__(self):
        return str(self.number)+"("+self.line.code+")"