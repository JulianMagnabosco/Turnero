from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('ping/', views.ping),
    path('lines/', views.lines),
    path('line/<int:id>', views.line),
    path('hello/<str:name>', views.hello)
]