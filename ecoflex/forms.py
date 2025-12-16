from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django import forms
from .models import User, Station
from datetime import date

User = get_user_model()

class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        label="Nom d'utilisateur",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez votre nom d\'utilisateur'
        }),
        error_messages={
            'required': 'Le nom d\'utilisateur est obligatoire.'
        }
    )
    password = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Entrez votre mot de passe'
        }),
        error_messages={
            'required': 'Le mot de passe est obligatoire.'
        }
    )

    error_messages = {
        'invalid_login': 'Nom d\'utilisateur ou mot de passe incorrect.',
        'inactive': 'Ce compte a été désactivé.',
    }

class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        label="Adresse e-mail",
        widget=forms.EmailInput(attrs={'class': 'form-control'}),
        error_messages={
            'required': "L'adresse e-mail est obligatoire",
            'invalid': "Veuillez entrer une adresse e-mail valide"
        }
    )

    password1 = forms.CharField(
        label="Mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text="Votre mot de passe doit contenir au moins 8 caractères",
        error_messages={
            'required': "Le mot de passe est obligatoire"
        }
    )

    password2 = forms.CharField(
        label="Confirmer le mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control'}),
        help_text="",
        error_messages={
            'required': "La confirmation du mot de passe est obligatoire"
        }
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2")
        labels = {
            'username': "Nom d'utilisateur",
        }
        error_messages = {
            'username': {
                'required': "Le nom d'utilisateur est obligatoire",
                'unique': "Ce nom d'utilisateur existe déjà"
            }
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs['class'] = 'form-control'

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            'last_name', 'first_name', 'email', 'phone_number', 'birth_date', 'address', 'city', 'province', 'postal_code'
        ]
        labels = {
            'last_name': 'Nom de famille',
            'first_name': 'Prénom',
            'email': 'Adresse e-mail',
            'phone_number': 'Numéro de téléphone',
            'birth_date': 'Date de naissance',
            'address': 'Adresse',
            'city': 'Ville',
            'province': 'Province',
            'postal_code': 'Code postal',
        }
        widgets = {
            'last_name': forms.TextInput(attrs={ 'class': 'form-control', 'placeholder': 'Entrez votre nom de famille'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control','placeholder': 'Entrez votre prénom'}),
            'email': forms.EmailInput(attrs={'class': 'form-control','placeholder': 'Entrez votre adresse e-mail'}),
            'phone_number': forms.TextInput(attrs={'class': 'form-control','placeholder': 'Entrez votre numéro de téléphone'}),
            'birth_date': forms.DateInput(attrs={'class': 'form-control','type': 'date','placeholder': 'Sélectionnez votre date de naissance'}),
            'address': forms.TextInput(attrs={'class': 'form-control','placeholder': 'Entrez votre adresse'}),
            'city': forms.TextInput(attrs={'class': 'form-control','placeholder': 'Entrez votre ville'}),
            'province': forms.TextInput(attrs={'class': 'form-control','placeholder': 'Entrez votre province'}),
            'postal_code': forms.TextInput(attrs={'class': 'form-control','placeholder': 'Entrez votre code postal'
            }),
        }

class ReservationForm(forms.Form):
    station = forms.ModelChoiceField(
        queryset=Station.objects.filter(actif=True, type_vehicule="voiture", capacite__gt=0).order_by('nom'),
        label="Station",
        empty_label="Sélectionnez une station",
        widget=forms.Select(attrs={'class': 'form-select'}),
        error_messages={
            'required': 'Veuillez sélectionner une station.',
            'invalid_choice': 'Station invalide.'
        }
    )

    date_reservation = forms.DateField(
        label="Date de réservation",
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        error_messages={
            'required': 'Veuillez sélectionner une date.',
            'invalid': 'Date invalide.'
        }
    )

    heure_debut = forms.TimeField(
        label="Heure de début",
        widget=forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
        error_messages={
            'required': 'Veuillez sélectionner une heure de début.',
            'invalid': 'Heure invalide.'
        }
    )



    heure_fin = forms.TimeField(
        label="Heure de fin",
        widget=forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
        error_messages={
            'required': 'Veuillez sélectionner une heure de fin.',
            'invalid': 'Heure invalide.'
        }
    )

    def clean(self):
        cleaned_data = super().clean()
        date_reservation = cleaned_data.get('date_reservation')
        heure_debut = cleaned_data.get('heure_debut')
        heure_fin = cleaned_data.get('heure_fin')

        if date_reservation and date_reservation < date.today():
            raise forms.ValidationError("La date de réservation ne peut pas être dans le passé.")

        if heure_debut and heure_fin and heure_fin <= heure_debut:
            raise forms.ValidationError("L'heure de fin doit être après l'heure de début.")

        return cleaned_data

from datetime import date

class AnnulationReservationForm(forms.Form):
    reservation = forms.ModelChoiceField(
        queryset=None,
        label="Réservation à annuler",
        empty_label="Sélectionnez une réservation",
        widget=forms.Select(attrs={'class': 'form-select'}),
        error_messages={
            'required': 'Veuillez sélectionner une réservation à annuler.',
            'invalid_choice': 'Réservation invalide.'
        }
    )

    def __init__(self, user=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            from .models import Reservation
            self.fields['reservation'].queryset = Reservation.objects.filter(
                utilisateur=user,
                statut='active',
                date_reservation__gte=date.today()
            ).select_related('station')
            self.fields['reservation'].label_from_instance = lambda obj: f"{obj.station.nom} - {obj.date_reservation} ({obj.heure_debut.strftime('%H:%M')} - {obj.heure_fin.strftime('%H:%M')})"