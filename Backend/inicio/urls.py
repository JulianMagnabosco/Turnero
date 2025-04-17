from django.urls import path
from . import views

urlpatterns = [
    path("", views.base, name="home"),
    path("lines_show/", views.lines_show, name="lines_show"),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.signout, name='logout'),
    path('signin/', views.signin, name='signin'),

    path("chat/", views.chat, name="index"),
    path("chat/<str:room_name>/", views.room, name="room"),

    path("api/trigger/", views.trigger_mensaje),

    path('api/signup/', views.api_signup),
    path('api/logout/', views.api_signout),
    path('api/signin/', views.api_signin),
    path("api/lines/", views.getAll),
    path("api/line/", views.addLine),
    path("api/line/<int:id>/", views.deleteLine),
    path("api/ticket/", views.addTicket),
    path("api/ticket/list/", views.addTicketList),
    path("api/ticket/<int:id>/", views.deleteTicket),
]