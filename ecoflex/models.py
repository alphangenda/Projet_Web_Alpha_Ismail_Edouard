from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    phone_number = models.CharField(max_length=20, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    province = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

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
