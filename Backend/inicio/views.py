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


# TODO:eliminar todo haasta websocket
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
        {"type": "chat.message", "message": {"data":"hola","type":"doupdate"}}
    )
    return JsonResponse({"status": "mensaje enviado por WebSocket"})

def chat(request):
    return render(request, "chat.html")

def room(request, room_name):
    return render(request, "room.html", {"room_name": room_name})


#API
@csrf_exempt
def user(request,id):
    
    user = User.objects.get(id=id)
    if not user:
        return JsonResponse({"error":"No encontrado"},status=404)
    userJson = {"id":user.id,"username":user.username,"admin":user.is_superuser}
    if request.method == "DELETE":
        user.delete()
        return JsonResponse(userJson)
    return JsonResponse(userJson)

@csrf_exempt
def userLines(request):
    if not request.user.is_superuser:
        return JsonResponse({"login": False},status=401)
    
    if request.method == "PUT":
        body = json.loads(request.body)
        user = User.objects.get(id=body["user"])
        if not user:
            return JsonResponse({"error":"No encontrado"},status=404)
        userJson = {"id":user.id,"username":user.username,"admin":user.is_superuser}
        for l in body["lines"]:
            line = Line.objects.get(code=l["code"])
            if l["selected"]:
                line.users.add(user)
            else:
                line.users.remove(user)
        return JsonResponse(userJson)


@csrf_exempt
def getUsers(request):
    if not request.user.is_superuser:
        return JsonResponse({"login": False},status=401)
    
    users = User.objects.select_related("lines").values()
    userList = list()
    for u in list(users):
        listRaw = Line.objects.filter(users__username=u["username"]).all() 

        listValues=list()
        for l in list(listRaw):
            listValues.append({"name":l.name,"code":l.code})

        userList.append({"id":u["id"],
                         "username":u["username"],
                         "admin":u["is_superuser"],
                         "lines":listValues})
    return JsonResponse({"list": userList})

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
        userJson = {"id":user.id,"username":user.username,"email":user.email,"admin":user.is_superuser}
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
                userJson = {"id":user.id,"username":user.username,"email":user.email,"admin":user.is_superuser}
                return JsonResponse({"register": True, "user": userJson})
            except IntegrityError:
                return JsonResponse({"register": False, "error": "Username already exist"},status=400)

        return JsonResponse({"register": False, "error": "Passwords did not match."},status=400)

@csrf_exempt
def getLines(request):
    username = request.user.username
    listRaw0 = Line.objects
    if not request.user.is_superuser:
        listRaw = listRaw0.filter(users__username=username).all() 
    else:
        listRaw = listRaw0.all() 

    listValues=list()
    for t in list(listRaw):
        listValues.append(t.json())

    return JsonResponse({"data": listValues})

@csrf_exempt
def getAll(request):
    username = request.user.username
    listRaw0 = Ticket.objects.select_related("user").select_related("line")
    listRaw1 = listRaw0.all() 

    print(Ticket.objects.count())

    listValues=list()
    for t in list(listRaw1):
        listValues.append(t.json())

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "chat_lobby",
        {
            "type": "chat.message", 
            "message": {
                "data": listValues,
                "type": "update"
            }
        }
    )
    return JsonResponse({"data": listValues})

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
        last = line.getTickets().last()
        lastNumber = last.number+1 if not last is None else 1
        Ticket.save(Ticket(number=lastNumber,line=line))
        getAll(request)
        return JsonResponse({"ticketNumber": lastNumber})
    return getAll(request)


@csrf_exempt
def addTicketList(request):
    if request.method == "POST":
        body = json.loads(request.body)
        for item in body["list"]:
            line = get_object_or_404(Line,code=item["code"])
            Ticket.save(Ticket(number=int(item["lastNumber"]),line=line))
    getAll(request)
    return JsonResponse({"list":body["list"]})

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