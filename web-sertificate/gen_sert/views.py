from django.shortcuts import render

def index(request):
    return render(request, 'gen_ser.html')