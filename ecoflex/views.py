from django.shortcuts import render, redirect
from django.http import HttpResponse
from .forms import RegisterForm, CustomAuthenticationForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout

def accueil(request):
    return render(request, 'ecoflex/index.html')

def placeholder_view(request):
    return HttpResponse(
        "<h1>Cette page n'est pas encore implémentée</h1>"
        "<p>Retournez à <a href='/'>l'accueil</a></p>"
    )

def tarif(request):
    return placeholder_view(request)

def fonctionnement(request):
    """
    Vue pour la page de fonctionnement
    """
    return render(request, 'ecoflex/fonctionnement.html')

def profil(request):
    return render(request, 'ecoflex/profil.html')

def gestion_users(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        messages.error(request, "Vous n'avez pas les permissions pour accéder à cette page.")
        return redirect('accueil')

    return render(request, 'ecoflex/gestion_users.html')

def connexion(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Bienvenue {user.username} !")
                return redirect('profil')
    else:
        form = CustomAuthenticationForm()
    return render(request, "ecoflex/connexion.html", {'form': form})

def deconnexion(request):
    logout(request)
    messages.success(request, 'Vous êtes déconnecté avec succès.')
    return redirect('accueil')

def inscription(request):
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

    return render(request, "ecoflex/inscription.html", {'form': form})