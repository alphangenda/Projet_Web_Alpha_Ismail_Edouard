from django.urls import path
from . import views

urlpatterns = [
    path('', views.accueil, name='accueil'),
    path('tarif/', views.tarif, name='tarif'),
    path('fonctionnement/', views.fonctionnement, name='fonctionnement'),
    path('map_location/', views.map_location, name='map_location'),
    path('api/stations/', views.StationListAPIView.as_view(), name='station-list'),
    path('profil/', views.profil, name='profil'),
    path('connexion/', views.connexion, name='connexion'),
    path('deconnexion/', views.deconnexion, name='deconnexion'),
    path('inscription/', views.inscription, name='inscription'),
    path('gestion_users/', views.gestion_users, name='gestion_users'),
    path('action_status/<int:user_id>/', views.action_status, name='action_status'),
    path('profil/modifier/', views.modifier_profil, name='modifier_profil'),







]