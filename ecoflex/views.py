from django.shortcuts import render, redirect
from django.http import HttpResponse
from .forms import RegisterForm, CustomAuthenticationForm, ProfileForm, ReservationForm, AnnulationReservationForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
import json

from rest_framework import generics
from .models import Station, Reservation
from .serializers import StationSerializerJson

User = get_user_model()

def accueil(request):
    return render(request, 'ecoflex/index.html')

def placeholder_view(request):
    return HttpResponse(
        "<h1>Cette page n'a pas encore été implémentée</h1>"
        "<p>Retournez à <a href='/'>l'accueil</a></p>"
    )

def tarif(request):
    return placeholder_view(request)

def fonctionnement(request):
    return render(request, 'ecoflex/fonctionnement.html')

def tarif(request):
    return render(request, 'ecoflex/tarif.html')

def map_location(request):
    return render(request, 'ecoflex/map_location.html')

class StationListAPIView(generics.ListAPIView):
    queryset = Station.objects.filter(actif=True)
    serializer_class = StationSerializerJson

def profil(request):
    return render(request, 'ecoflex/profil.html')

def gestion_users(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        messages.error(request, "Vous n'avez pas les permissions pour accéder à cette page.")
        return redirect('accueil')

    users = User.objects.filter(is_superuser=False).order_by('-date_joined')

    return render(request, 'ecoflex/gestion_users.html', {'users': users})

def action_status(request, user_id):
    """
    Active ou désactive un compte utilisateur
    """
    if not request.user.is_authenticated or not request.user.is_staff:
        messages.error(request, "Vous n'avez pas les permissions pour effectuer cette action.")
        return redirect('accueil')

    try:
        user = User.objects.get(id=user_id)

        if user == request.user:
            messages.error(request, "Vous ne pouvez pas désactiver votre propre compte.")
            return redirect('gestion_users')

        if user.is_superuser:
            messages.error(request, "Vous ne pouvez pas désactiver un superutilisateur.")
            return redirect('gestion_users')

        user.is_active = not user.is_active
        user.save()

        status = "activé" if user.is_active else "désactivé"
        messages.success(request, f"Le compte de {user.username} a été {status}.")

    except User.DoesNotExist:
        messages.error(request, "Utilisateur introuvable.")
    return redirect('gestion_users')

def connexion(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                if not user.is_active:
                    form.add_error(None, "Votre compte a été désactivé. Contactez un administrateur.")
                else:
                    login(request, user)
                    messages.success(request, f"Bienvenue {user.username} !")
                    return redirect('profil')
            else:
                form.add_error(None, "Nom d'utilisateur ou mot de passe incorrect.")
        else:
            if not form.errors:
                form.add_error(None, "Nom d'utilisateur ou mot de passe incorrect.")
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

def modifier_profil(request):
    if request.method == "POST":
        form = ProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Profil mis à jour avec succès !")
            return redirect("profil")
    else:
        form = ProfileForm(instance=request.user)

    return render(request, "ecoflex/modifier_profil.html", {"form": form})

@csrf_exempt
@require_POST
def louer_vehicule(request, station_id):

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentification requise.'}, status=401)

    try:
        data = json.loads(request.body.decode('utf-8'))
        numero_permis_saisi = data.get('numero_permis')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Requête invalide.'}, status=400)

    if not numero_permis_saisi:
        return JsonResponse({'error': 'Numéro de permis manquant.'}, status=400)

    if str(numero_permis_saisi).strip() != str(request.user.numero_permis).strip():
        return JsonResponse({'error': 'Numéro de permis invalide.'}, status=403)


    station = Station.objects.get(pk=station_id, actif=True)

    if station.capacite <= 0:
        return JsonResponse({'error': 'Aucun véhicule disponible à cette station.'}, status=400)

    station.capacite -= 1
    station.save()

    return JsonResponse({'message': f'Location confirmée à la station {station.nom}.'}, status=200)

def annuler_location(request):
    if request.method == "POST":
        messages.success(request, "Location annulée avec succès.")
        return redirect('map_location')
    else:
        messages.success(request, "Location annulée avec succès.")
    return redirect('map_location')

def reserver_voiture(request):
    if not request.user.is_authenticated:
        messages.error(request, "Vous devez être connecté pour réserver une voiture.")
        return redirect('connexion')

    reservation_form = ReservationForm()
    annulation_form = AnnulationReservationForm(user=request.user)

    if request.method == 'POST':
        if 'reserver' in request.POST:
            reservation_form = ReservationForm(request.POST)
            if reservation_form.is_valid():
                Reservation.objects.create(
                    utilisateur=request.user,
                    station=reservation_form.cleaned_data['station'],
                    date_reservation=reservation_form.cleaned_data['date_reservation'],
                    heure_debut=reservation_form.cleaned_data['heure_debut'],
                    heure_fin=reservation_form.cleaned_data['heure_fin'],
                    statut='active'
                )
                messages.success(request, "Réservation confirmée avec succès!")
                return redirect('map_location')

        elif 'annuler' in request.POST:
            annulation_form = AnnulationReservationForm(user=request.user, data=request.POST)
            if annulation_form.is_valid():
                reservation = annulation_form.cleaned_data['reservation']
                reservation.statut = 'annulee'
                reservation.save()
                messages.success(request, "Réservation annulée avec succès!")
                return redirect('map_location')

    return render(request, 'ecoflex/reservations.html', {
        'reservation_form': reservation_form,
        'annulation_form': annulation_form
    })