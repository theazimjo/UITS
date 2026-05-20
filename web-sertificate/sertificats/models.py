from django.db import models

class Sertifikatlar(models.Model):
    class Courses(models.TextChoices):
        CS = '001', 'KS'
        PHOTOSHOP = '002', 'Photoshop'
        WEB = '003', 'Web'
        MAX3D = '004', '3Dmax'
        ADMIN = '005', 'Admin'
        PYTHON = '006', 'Python'
        FOUNDATION = '007', 'Foundation'
        WEB_DEV = '008', 'Web dasturlash'
        MS_WORD = '009', 'MS Word'

    courses = models.CharField(max_length=5, choices=Courses.choices, default=Courses.CS)


class Certificate(models.Model):
    full_name = models.CharField(max_length=255)
    cert_id = models.CharField(max_length=20, unique=True)
    date = models.CharField(max_length=20)
    template = models.CharField(max_length=255, null=True, blank=True)


    def __str__(self):
        return f"{self.cert_id} - {self.full_name}"