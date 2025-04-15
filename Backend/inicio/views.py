from django.shortcuts import render,redirect,get_object_or_404
from django.http import HttpResponse,JsonResponse
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token

from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Line,Ticket
import json

def base(request):
    return redirect('signin')

@login_required
def signout(request):
    logout(request)
    return redirect('home')


def signin(request):
    if request.method == 'GET':
        return render(request, 'signin.html', {"form": AuthenticationForm})
    else:
        user = authenticate(
            request, username=request.POST['username'], password=request.POST['password'])
        if user is None:
            return render(request, 'signin.html', {"form": AuthenticationForm, "error": "Username or password is incorrect."})

        login(request, user)
        return redirect('lines_show')
    
def signup(request):
    if request.method == 'GET':
        return render(request, 'signup.html', {"form": UserCreationForm})
    else:

        if request.POST["password1"] == request.POST["password2"]:
            try:
                user = User.objects.create_user(
                    request.POST["username"], password=request.POST["password1"])
                user.save()
                login(request, user)
                return redirect('lines_show')
            except IntegrityError:
                return render(request, 'signup.html', {"form": UserCreationForm, "error": "Username already exists."})

        return render(request, 'signup.html', {"form": UserCreationForm, "error": "Passwords did not match."})


@login_required
def lines_show(request):
    lines_show = Line.objects.all()
    return render(request, 'lines_show.html', {"lines_show": lines_show})


#WebSocket
def trigger_mensaje(request):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "chat_lobby",
        {"type": "chat.message", "message": "HOllas"}
    )
    return JsonResponse({"status": "mensaje enviado por WebSocket"})

def chat(request):
    return render(request, "chat.html")

def room(request, room_name):
    return render(request, "room.html", {"room_name": room_name})


#API
@csrf_exempt
def api_signout(request):
    if not request.user.is_authenticated:
        return JsonResponse({"login": False},status=401)
    logout(request)
    return JsonResponse({"login": True})


@csrf_exempt
def api_signin(request):
    if request.method == 'POST':
        body = json.loads(request.body)
        user = authenticate(
            request, username=body['username'], password=body['password'])
        if user is None:
            return JsonResponse({"login": False},status=401)

        login(request, user)
        userJson = {"id":user.id,"username":user.username,"email":user.email,"role":"ADMIN"}
        return JsonResponse({"login": True, "user": userJson, "token": get_token(request)})
    
@csrf_exempt
def api_signup(request):
    if request.method == 'POST':
        body = json.loads(request.body)

        if body["password1"] == body["password2"]:
            try:
                user = User.objects.create_user(
                    body["username"], password=body["password1"])
                user.save()
                login(request, user)
                return JsonResponse({"register": True, "user": user, "token": get_token(request)})
            except IntegrityError:
                return JsonResponse({"register": False, "error": "Username already exist"},status=401)

        return JsonResponse({"register": False, "error": "Passwords did not match."},status=401)

@csrf_exempt
def getAll(request):
    # if not request.user.is_authenticated:
    #     return JsonResponse({"login": False},status=401)
    
    lineList=list(Line.objects.all())
    lineListValues=list()
    for l in lineList:
        lineListValues.append(l.json())

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "chat_lobby",
        {
            "type": "chat.message", 
            "message": lineListValues
        }
    )
    return JsonResponse({"data": lineListValues})

@csrf_exempt
def addLine(request):
    if not request.user.is_authenticated:
        return JsonResponse({"login": False},status=401)
    if request.method == "POST":
        body = json.loads(request.body)
        newline = Line(name=body["name"],code=body["code"])
        Line.save(newline)
    return getAll(request)

@csrf_exempt
def addTicket(request):
    if request.method == "POST":
        body = json.loads(request.body)
        line = get_object_or_404(Line,code=body["code"])
        Ticket.save(Ticket(number=Ticket.objects.filter(line=line).count()+1,line=line))
    return getAll(request)

@csrf_exempt
def deleteLine(request,id):
    if not request.user.is_authenticated:
        return JsonResponse({"login": False},status=401)
    if request.method == "DELETE":
        line = get_object_or_404(Line,pk=id)
        Line.delete(line)
    return getAll(request)

@csrf_exempt
def deleteTicket(request,id):
    if not request.user.is_authenticated:
        return JsonResponse({"login": False},status=401)
    if request.method == "DELETE":
        ticket = get_object_or_404(Ticket,pk=id)
        Ticket.delete(ticket)
    return getAll(request)