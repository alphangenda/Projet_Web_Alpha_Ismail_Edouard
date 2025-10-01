from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from django import forms

User = get_user_model()

class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )

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

from .models import User

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
