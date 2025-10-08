from .models import Station
from rest_framework import serializers

class StationSerializerJson(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields =  ['id', 'nom', 'latitude', 'longitude', 'type_vehicule', 'capacite', 'actif']