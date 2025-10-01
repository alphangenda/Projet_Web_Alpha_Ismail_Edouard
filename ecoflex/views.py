from django.shortcuts import render
from django.http import HttpResponse

def accueil(request):
    """
    Vue pour la page d'accueil
    """
    return render(request, 'ecoflex/index.html')

def placeholder_view(request):
    """
    Vue placeholder pour les pages non encore implémentées
    """
    return HttpResponse(
        "<h1>Cette page n'est pas encore implémentée</h1>"
        "<p>Retournez à <a href='/'>l'accueil</a></p>"
    )

def tarif(request):
    """
    Vue pour la page des tarifs (placeholder)
    """
    return placeholder_view(request)

def fonctionnement(request):
    """
    Vue pour la page de fonctionnement
    """
    return render(request, 'ecoflex/fonctionnement.html')

def profil(request):
    """
    Vue pour la page profil (placeholder)
    """
    return placeholder_view(request)

def connexion(request):
    """
    Vue pour la page de connexion (placeholder)
    """
    return placeholder_view(request)

def inscription(request):
    """
    Vue pour la page d'inscription (placeholder)
    """
    return placeholder_view(request)