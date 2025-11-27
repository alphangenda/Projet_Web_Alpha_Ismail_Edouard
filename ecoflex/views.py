from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .forms import RegisterForm, CustomAuthenticationForm, ProfileForm, ReservationForm, AnnulationReservationForm
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model

from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import json

from rest_framework import generics
from .models import Station, Reservation, Location, Location, Offres, AbonnementUtilisateur
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
    return render(request, 'ecoflex/tarif.html')


def abonnement(request):
    return render(request, 'ecoflex/tarif.html')

def fonctionnement(request):
    return render(request, 'ecoflex/fonctionnement.html')


def map_location(request):
    return render(request, 'ecoflex/map_location.html')

@login_required
def api_abonnement_actif(request):
    """
    Retourne l'abonnement actif de l'utilisateur s'il existe.
    """
    abo = request.user.abonnement_actif()

    if not abo:
        return JsonResponse({"has": False})

    offre = abo.offre

    return JsonResponse({
        "has": True,
        "type": offre.type_abonnement,
        "libelle": offre.get_type_abonnement_display(),
        "vehicule": offre.vehicule,
        "duree_minutes": offre.duree_minutes or 0,
        "prix": f"{offre.prix} {offre.unite}",
    })

def activer_abonnement(request, vehicule, type):
    if not request.user.is_authenticated:
        return redirect("connexion")

    offre = get_object_or_404(
        Offres,
        vehicule=vehicule,
        type_abonnement=type
    )

    AbonnementUtilisateur.objects.filter(
        utilisateur=request.user,
        actif=True
    ).update(actif=False, date_fin=timezone.now())

    abo = AbonnementUtilisateur.objects.create(
        utilisateur=request.user,
        offre=offre,
        actif=True,
        date_debut=timezone.now()
    )

    abo.activer()

    messages.success(request, "Votre abonnement a été activé avec succès !")
    return redirect("tarif")

class StationListAPIView(generics.ListAPIView):
    queryset = Station.objects.filter(actif=True)
    serializer_class = StationSerializerJson

def profil(request):
    if request.user.is_authenticated:
        dernieres_locations = Location.objects.filter(utilisateur=request.user).order_by('-date_location')[:10]

        return render(request, 'ecoflex/profil.html', {
            'dernieres_locations': dernieres_locations
        })

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
        station = Station.objects.get(pk=station_id, actif=True)
    except Station.DoesNotExist:
        return JsonResponse({'error': 'Station introuvable.'}, status=404)

    if station.capacite <= 0:
        return JsonResponse({'error': 'Aucun véhicule disponible à cette station.'}, status=400)

    location_existante = Location.objects.filter(
        utilisateur=request.user,
        statut='en_cours'
    ).first()

    if location_existante:
        return JsonResponse({
            'error': 'Vous avez déjà une location en cours.',
            'location_id': location_existante.id
        }, status=400)

    location = Location.objects.create(
        utilisateur=request.user,
        station=station,
        numero_permis_utilise=request.user.numero_permis,
        statut='en_cours'
    )

    locations_utilisateur = Location.objects.filter(utilisateur=request.user).order_by('-date_location')
    if locations_utilisateur.count() > 10:
        ids_a_garder = list(locations_utilisateur.values_list('id', flat=True)[:10])
        Location.objects.filter(utilisateur=request.user).exclude(id__in=ids_a_garder).delete()

    station.capacite -= 1
    station.save()

    return JsonResponse({
        'success': True,
        'message': f'Location confirmée à la station {station.nom}.',
        'location_id': location.id
    }, status=200)


@csrf_exempt
def activer_reservation(request, reservation_id):
    if not request.user.is_authenticated:
        messages.error(request, "Vous devez être connecté.")
        return redirect('connexion')

    if request.method != 'POST':
        messages.error(request, "Méthode non autorisée.")
        return redirect('profil')

    try:
        reservation = Reservation.objects.get(
            id=reservation_id,
            utilisateur=request.user,
            statut='active'
        )

        if not reservation.peut_etre_activee():
            messages.error(request, "Cette réservation ne peut pas encore être activée ou a expiré.")
            return redirect('profil')

        station = reservation.station
        if station.capacite <= 0:
            stations_proches = Station.objects.filter(
                type_vehicule=station.type_vehicule,
                actif=True,
                capacite__gt=0
            ).exclude(id=station.id)[:3]

            if stations_proches.exists():
                noms_stations = ', '.join([s.nom for s in stations_proches])
                messages.error(
                    request,
                    f"Plus de véhicules disponibles à {station.nom}. "
                    f"Essayez : {noms_stations}"
                )
            else:
                messages.error(request, f"Plus de véhicules disponibles à {station.nom}.")

            return redirect('profil')

        location = Location.objects.create(
            utilisateur=request.user,
            station=station,
            numero_permis_utilise=request.user.numero_permis,
            statut='en_cours'
        )

        reservation.statut = 'en_cours'
        reservation.location = location
        reservation.save()

        station.capacite -= 1
        station.save()

        messages.success(request, f"Location débutée avec succès à {station.nom} !")
        return redirect('map_location')

    except Reservation.DoesNotExist:
        messages.error(request, "Réservation introuvable.")
        return redirect('profil')
    except Exception as e:
        messages.error(request, f"Erreur : {str(e)}")
        return redirect('profil')

@csrf_exempt
def annuler_location(request):
    if not request.user.is_authenticated:
        messages.error(request, "Vous devez être connecté.")
        return redirect('connexion')

    if request.method != 'POST':
        messages.error(request, "Méthode non autorisée.")
        return redirect('map_location')

    location_id = request.POST.get('location_id')

    try:
        if location_id:
            location = Location.objects.get(
                id=location_id,
                utilisateur=request.user,
                statut='en_cours'
            )
        else:
            location = Location.objects.filter(
                utilisateur=request.user,
                statut='en_cours'
            ).first()

        if not location:
            messages.error(request, "Aucune location en cours trouvée.")
            return redirect('map_location')

        location.statut = 'terminee'
        location.date_retour = timezone.now()
        location.save()

        station = location.station
        station.capacite += 1
        station.save()



        messages.success(request, "Location terminée avec succès.")

    except Location.DoesNotExist:
        messages.error(request, "Location introuvable.")
    except Exception as e:
        messages.error(request, f"Erreur : {str(e)}")

    return redirect('profil')

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


def rechercher_stations_ajax(request):
    """
    API AJAX pour rechercher des stations en temps réel
    """
    query = request.GET.get('q', '').strip()

    if len(query) < 2:
        return JsonResponse({
            'success': False,
            'message': 'Entrez au moins 2 caractères'
        })

    stations = Station.objects.filter(
        actif=True,
        nom__icontains=query
    ).values('id', 'nom', 'type_vehicule', 'capacite', 'latitude', 'longitude')[:5]

    return JsonResponse({
        'success': True,
        'results': list(stations),
        'count': len(stations)
    })

def custom_400(request, exception=None):
    return render(request, '400.html', status=400)

def custom_401(request, exception=None):
    return render(request, '401.html', status=401)

def custom_402(request, exception=None):
    return render(request, '402.html', status=402)

def custom_403(request, exception=None):
    return render(request, '403.html', status=403)

def custom_404(request, exception=None):
    return render(request, '404.html', status=404)

def custom_500(request):
    return render(request, '500.html', status=500)