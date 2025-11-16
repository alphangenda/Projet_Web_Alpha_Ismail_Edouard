from django.db import models
from django.contrib.auth.models import AbstractUser
import random
from django.conf import settings

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