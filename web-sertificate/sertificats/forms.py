from django import forms
from .models import Sertifikatlar

class SertGenForm(forms.ModelForm):
    class Meta:
        model = Sertifikatlar
        fields = ['courses']