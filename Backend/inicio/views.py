from django.shortcuts import render,redirect,get_object_or_404
from django.http import HttpResponse,JsonResponse
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
from .models import Line,Ticket

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

def chat(request):
    return render(request, "chat.html")

def room(request, room_name):
    return render(request, "room.html", {"room_name": room_name})


#API

def getAll(request):
    lineList=list(Line.objects.all())
    lineListValues=list()
    for l in lineList:
        lineListValues.append(l.json())
    return JsonResponse({"lines":lineListValues})

def addTicket(request):
    if request.method == "POST":
        line = Line.objects.first(code=request.POST["code"])
        Ticket.save(Ticket(Ticket.objects.count(),line))
        return JsonResponse(Line.objects.v(),safe=False)
    else :
        getAll(request)

def addLine(request):
    if request.method == "POST":
        Line.save(Line(request.POST["name"],request.POST["code"]))
        return JsonResponse(Line.objects.all(),safe=False)
    else :
        getAll(request)

def takeTicket(request,id):
    if request.method == "DELETE":
        line = Ticket.objects.first(pk=id)
        Ticket.save(Ticket(Ticket.objects.count(),line))
        return JsonResponse(Line.objects.all(),safe=False)
    else :
        getAll(request)