from django.contrib import admin

# Register your models here.
from .models import Line, Ticket, Consult

admin.site.register(Line)
admin.site.register(Ticket)
admin.site.register(Consult)
