from django.contrib import admin
from .models import User, Station, Offres, AbonnementUtilisateur
from django.contrib.auth.admin import UserAdmin

admin.site.site_header = "Administration EcoFlex"
admin.site.site_title = "EcoFlex Admin"
admin.site.index_title = "Gestion de la plateforme de mobilité"

@admin.register(User)
class UserAdministration(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'first_name', 'last_name', 'email')


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type_vehicule', 'capacite', 'actif')
    list_filter = ('type_vehicule', 'actif')
    search_fields = ('nom',)


@admin.register(Offres)
class OffresAdmin(admin.ModelAdmin):
    list_display = ('vehicule', 'type_abonnement', 'prix', 'unite', 'populaire')
    list_filter = ('vehicule', 'type_abonnement', 'populaire')
    search_fields = ('vehicule', 'type_abonnement')

@admin.register(AbonnementUtilisateur)
class AbonnementUtilisateurAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'offre', 'date_debut', 'date_fin', 'actif')
    list_filter = ('offre__vehicule', 'offre__type_abonnement', 'actif')
    search_fields = ('utilisateur__username', 'utilisateur__first_name', 'utilisateur__last_name')