from django.urls import path
from . import views

urlpatterns = [
    path('', views.base),
    path("chat/", views.chat, name="index"),
    path("chat/<str:room_name>/", views.room, name="room"),
]