from django.contrib import admin
from .models import User
from django.contrib.auth.admin import UserAdmin

admin.site.site_header = "Administration EcoFlex"
admin.site.site_title = "EcoFlex Admin"
admin.site.index_title = "Gestion de la plateforme de mobilité"

@admin.register(User)
class UserAdministration(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'first_name', 'last_name', 'email')

    fieldsets = UserAdmin.fieldsets + (
        ('Statut du compte', {'fields': ('is_active',)}),
    )