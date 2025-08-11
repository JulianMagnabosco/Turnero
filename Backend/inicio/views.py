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

from .models import Consult, Line,Ticket
import json
from piper.voice import PiperVoice
import soundfile as sf
import numpy as np
import io


MODEL_PATH = "./tts_models/es_ES-davefx-medium.onnx"  # Cambiar por ruta real

voice = PiperVoice.load(MODEL_PATH)

#TTS
def tts(request):
    text = request.GET.get('text')  # Get a single value
    if not text:
        return JsonResponse({'error': 'Falta el texto'})

    # Generar audio y extraer datos desde AudioChunk
    chunks = list(voice.synthesize(text))
    audio_data = np.concatenate([chunk.audio_float_array for chunk in chunks])  # .data es ndarray de float32

    # Guardar en WAV en memoria
    buffer = io.BytesIO()
    sf.write(buffer, audio_data, voice.config.sample_rate, format='WAV', subtype='PCM_16')
    buffer.seek(0)

    response = HttpResponse(buffer, content_type="audio/wav")
    response["Content-Disposition"] = 'inline; filename="voz.wav"'
    return response

#WebSocket
def trigger_mensaje(request):
    chat = "chat_lobby"
    if request.GET.get("consult"):
        chat = "consult_lobby"
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        chat,
        {"type": "chat.message", "message": {"data":"hola","type":"doupdate"}}
    )
    return JsonResponse({"status": "mensaje enviado por WebSocket"})


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
    
    users = User.objects.select_related("lines").order_by("id").values()
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
def api_resetpass(request):
    if not request.user.is_superuser:
        return JsonResponse({"login": False},status=401)
    else:
        body = json.loads(request.body)
        admin = authenticate(
            request, username=request.user.username, password=body['password1'])
        user = User.objects.get(username=body['username'])
        if user is None or admin is None:
            return JsonResponse({"resetpassword": False, "error": "Not found or bad credentials"},status=404)
        
        
        user.set_password(body['password2'])
        user.save()
        return JsonResponse({"resetpassword": True})



@csrf_exempt
def getLines(request):
    username = request.user.username
    listRaw0 = Line.objects
    if request.user.is_authenticated and not request.user.is_superuser:
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
    listRaw0 = Ticket.objects.select_related("user").select_related("line").filter(called=False).order_by("number")
    listRaw1 = listRaw0.all() 

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
        totem = body["totem"]
        last = line.getTickets().last()
        lastNumber = last.number+1 if not last is None else 1
        Ticket.save(Ticket(number=lastNumber,line=line,totem=totem))
        getAll(request)
        return JsonResponse({"ticketNumber": lastNumber})
    return getAll(request)


@csrf_exempt
def addTicketList(request):
    if request.method == "POST":
        body = json.loads(request.body)
        totem = body["totem"]
        for item in body["list"]:
            line = get_object_or_404(Line,code=item["code"])
            lastNumber = int(item["lastNumber"])
            Ticket.save(Ticket(number=lastNumber,line=line,totem=totem))
    getAll(request)
    return JsonResponse({"list":body["list"]})


@csrf_exempt
def addConsult(request):
    body = json.loads(request.body)
    consult = Consult(patient=body["patient"],room=body["room"])
    Consult.save(consult)
    chat = "consult_lobby"
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
    chat,
        {
        "type": "chat.message", 
            "message": {
                "data": consult.json(),
                "type": "call"
            }
        }
    )
    return JsonResponse({"consult": consult.json()})
    


@csrf_exempt
def getConsults(request):
    consults = Consult.objects.all()
    clist = list()
    for c in consults:
        clist.append(c.json())
        
    chat = "consult_lobby"
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
    chat,
        {
        "type": "chat.message", 
            "message": {
                "data": clist,
                "type": "update"
            }
        }
    )
    return JsonResponse({"consults": clist})
    

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