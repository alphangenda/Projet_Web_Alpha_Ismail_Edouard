from django.urls import path
from . import views

urlpatterns = [
    path('', views.accueil, name='accueil'),
    path('tarif/', views.tarif, name='tarif'),
    path('fonctionnement/', views.fonctionnement, name='fonctionnement'),
    path('profil/', views.profil, name='profil'),
    path('connexion/', views.connexion, name='connexion'),
    path('inscription/', views.inscription, name='inscription'),
    path('gestion_users/', views.gestion_users, name='gestion_users')
]