from datetime import timedelta, timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
import random
from django.conf import settings
from datetime import timedelta
from django.utils import timezone

class User(AbstractUser):

    numero_permis = models.CharField(max_length=5, unique=True, blank=True, null=True)

    phone_number = models.CharField(max_length=20, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    province = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def abonnement_actif(self):
        return self.abonnements.filter(actif=True).order_by('-date_debut').first()

    def save(self, *args, **kwargs):
        """Génère un numéro de permis unique à 5 chiffres si non défini."""
        if not self.numero_permis:
            self.numero_permis = self._generer_code_unique()
        super().save(*args, **kwargs)

    def _generer_code_unique(self):
        """Retourne un code unique à 5 chiffres non utilisé par un autre utilisateur."""
        while True:
            code = str(random.randint(10000, 99999))
            if not User.objects.filter(numero_permis=code).exists():
                return code

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        else:
            return self.username

class Offres(models.Model):

    VEHICULES = [
        ('velo', 'Vélo'),
        ('trottinette', 'Trottinette'),
        ('voiture', 'Voiture'),
    ]

    TYPES = [
        ('occasionnel', 'Occasionnel'),
        ('journalier', 'Journalier'),
        ('mensuel', 'Mensuel'),
        ('annuel', 'Annuel'),
    ]

    vehicule = models.CharField(max_length=20, choices=VEHICULES)
    type_abonnement = models.CharField(max_length=20, choices=TYPES)

    prix = models.DecimalField(max_digits=6, decimal_places=2)
    unite = models.CharField(max_length=50)

    prix_secondaire = models.CharField(max_length=100, blank=True)
    # Journalier : 19,00 $ / 24 h

    duree_incluse = models.CharField(max_length=100, blank=True)

    # Trajets illimités de 30 minutes

    tarif_supplementaire = models.CharField(max_length=200, blank=True)

    # + 0,25 $ / minute après 30 minutes

    depot = models.CharField(max_length=100, blank=True)

    # Dépôt remboursable de 100 $ / vélo

    avantages = models.TextField(blank=True)
    # liste ou texte libre (avantages, assurance, recharge, etc.)

    populaire = models.BooleanField(default=False)

    duree_minutes = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['vehicule', 'type_abonnement']

    def __str__(self):
        return f"{self.vehicule} - {self.type_abonnement}"

class AbonnementUtilisateur(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='abonnements')
    offre = models.ForeignKey(Offres, on_delete=models.CASCADE, related_name='abonnements_utilisateurs')

    date_debut = models.DateTimeField()
    date_fin = models.DateTimeField(null=True, blank=True)
    actif = models.BooleanField(default=True)

    def activer(self):
        self.date_debut = timezone.now()

        if self.offre.type_abonnement == 'journalier':
            self.date_fin = self.date_debut + timedelta(hours=24)
        elif self.offre.type_abonnement == 'mensuel':
            self.date_fin = self.date_debut + timedelta(days=30)
        elif self.offre.type_abonnement == 'annuel':
            self.date_fin = self.date_debut + timedelta(days=365)
        elif self.offre.type_abonnement == 'occasionnel':
            self.date_fin = None

        self.save()

    def desactiver(self):
        self.actif = False
        self.date_fin = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.utilisateur.username} - {self.offre.type_abonnement}"

class Station(models.Model):
    TYPE_VEHICULE = [
        ("velo", "Vélo"),
        ("trottinette", "Trottinette"),
        ("voiture", "Voiture"),
    ]

    nom = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    type_vehicule = models.CharField(max_length=20, choices=TYPE_VEHICULE)
    capacite = models.PositiveIntegerField(default=0)
    actif = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Station"
        verbose_name_plural = "Stations"

    def __str__(self):
        return f"{self.nom} ({self.type_vehicule})"

class Reservation(models.Model):
    STATUT_CHOICES = [
        ('active', 'Active'),
        ('annulee', 'Annulée'),
        ('terminee', 'Terminée'),
        ('en_cours', 'En cours'),
    ]
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='reservations')
    date_reservation = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='active')
    date_creation = models.DateTimeField(auto_now_add=True)


    class Meta:
        ordering = ['-date_reservation', '-heure_debut']
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'

    def __str__(self):
        return f"{self.utilisateur.username} - {self.station.nom} - {self.date_reservation}"

class Location(models.Model):
    utilisateur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='locations')
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='locations')
    date_location = models.DateTimeField(auto_now_add=True)
    date_retour = models.DateTimeField(null=True, blank=True)
    numero_permis_utilise = models.CharField(max_length=5)
    statut = models.CharField(
        max_length=20,
        choices=[
            ('en_cours', 'En cours'),
            ('terminee', 'Terminée'),
        ],
        default='en_cours'
    )

    class Meta:
        ordering = ['-date_location']
        verbose_name = 'Location'
        verbose_name_plural = 'Locations'

    def __str__(self):
        return f"{self.utilisateur.username} - {self.station.nom} - {self.date_location.strftime('%Y-%m-%d %H:%M')}"