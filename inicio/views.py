from django.shortcuts import render,redirect,get_object_or_404
from django.http import HttpResponse,JsonResponse
from .models import Line
from .forms import LineForm

# Create your views here.

def totem(request):
    options = ({"code":"OC","name":"OC"},
               {"code":"P","name":"Pediatria"},
               {"code":"P","name":"Pediatria"},
               {"code":"P","name":"Pediatria"},
               {"code":"P","name":"Pediatria"})
    return render(request, 'base.html', {"options": options})

def totem(request):
    options = ({"code":"OC","name":"OC"},
               {"code":"P","name":"Pediatria"},
               {"code":"P","name":"Pediatria"},
               {"code":"P","name":"Pediatria"},
               {"code":"P","name":"Pediatria"})
    return render(request, 'base.html', {"options": options})

def chat(request):
    return render(request, "chat.html")

def room(request, room_name):
    return render(request, "room.html", {"room_name": room_name})
