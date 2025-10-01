from django.shortcuts import render, redirect
from django.shortcuts import render, redirect
from django.http import HttpResponse
from .forms import RegisterForm, CustomAuthenticationForm
from django.contrib import messages
from django.contrib.auth import authenticate, login

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
    Vue pour la page fonctionnement (placeholder)
    """
    return placeholder_view(request)

def profil(request):
    """
    Vue pour la page profil (placeholder)
    """
    return placeholder_view(request)

def connexion(request):
    """
    Vue pour la page de connexion (placeholder)
    """
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_superuser is False:
                    login(request, user)
                    messages.success(request, f"Bienvenue {user.username} !")
                    return redirect('home')
                else:
                    user.is_staff = True
                    login(request, user)
                    messages.success(request, f"Bienvenue {user.username} !")
                    return redirect('home')
    else:
        form = CustomAuthenticationForm()
    return render(request, "ecoflex/connexion.html", {'form':form})

def inscription(request):
    """
    Vue pour la page d'inscription (placeholder)
    """

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, 'Compte créé avec succès !')
            return redirect('connexion')
        else:
            messages.error(request, 'Veuillez corriger les erreurs ci-dessous.')
    else:
        form = RegisterForm()

    return render(request, "ecoflex/inscription.html", {'form':form})