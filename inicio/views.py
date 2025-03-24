from django.shortcuts import render,get_object_or_404
from django.http import HttpResponse,JsonResponse
from inicio.models import Line

# Create your views here.
def index(request):
    title="Index Variable"
    lines = list(Line.objects.values())
    emptyList = len(lines)<=0
    return render(request,'index.html',{
        "title":title,
        "emptyList":emptyList
    })

def ping(request):
    return HttpResponse("pong")


def hello(request,name):
    return HttpResponse("Hello %s" % name)


def lines(request):
    lines = list(Line.objects.values())
    return JsonResponse(lines,safe=False)

def line(request,id):
    line = get_object_or_404(Line,id=id)
    return HttpResponse(line.name)