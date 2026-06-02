from django.http import HttpResponse, FileResponse, Http404, StreamingHttpResponse
from django.shortcuts import render
import os
import cv2
import zipfile
import qrcode
import numpy as np
from django.conf import settings
from .models import Certificate
from .sheets import get_data_by_key
from .constants import PATH
from wsgiref.util import FileWrapper


def get_uzbek_course_name(template_path):
    if not template_path:
        return "Maxsus Kurs"
    tp = template_path.lower()
    if 'computer_science' in tp or 'ks' in tp:
        return "Kompyuter Savodxonligi"
    elif 'grafik_design' in tp or 'photo' in tp:
        return "Grafik Dizayn"
    elif 'admin' in tp:
        return "Zamonaviy Ofis Menejeri"
    elif 'web_design' in tp or 'webdes' in tp:
        return "Veb Dizayn (UI/UX)"
    elif 'front_end' in tp or 'web_react' in tp or 'webprogram' in tp:
        return "Frontend Dasturlash"
    elif 'python' in tp or 'py' in tp:
        return "Python Backend Dasturlash"
    elif 'max3d_int' in tp:
        return "3D Max Interior Design"
    elif 'max3d_ext' in tp:
        return "3D Max Exterior Design"
    elif 'max3d_mod' in tp:
        return "3D Max Modeling"
    elif '3dmax' in tp:
        return "3D Max"
    elif 'ms_word' in tp or 'word' in tp:
        return "MS Word"
    elif 'doctor' in tp:
        return "Tibbiyot Malaka Oshirish Kursi"
    return "Professional O'quv Kursi"



def get_hosts(request):
    scheme = request.scheme
    host = request.get_host()
    host_url = f"{scheme}://{host}/sertifikat/verify-certificate/"
    host2_url = f"{scheme}://{host}/sertifikat/doctors/verify-certificate/"
    return host_url, host2_url

def generate_qr_code(data, size=500):
    qr = qrcode.QRCode(box_size=10, border=1)
    qr.add_data(data)
    qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
    qr.make(fit=True)
    qr_img = qr_img.resize((size, size))
    return cv2.cvtColor(np.array(qr_img), cv2.COLOR_RGB2BGR)


def verify_certificate(request, cert_id):
    try:
        cert = Certificate.objects.get(cert_id=cert_id)
    except Certificate.DoesNotExist:
        raise Http404("Sertifikat topilmadi")

    course_name = get_uzbek_course_name(cert.template)
    image_url = f"/sertifikat/verify-certificate/{cert_id}/image/"
    download_url = f"/sertifikat/verify-certificate/{cert_id}/image/?download=true"

    context = {
        'cert': cert,
        'course_name': course_name,
        'image_url': image_url,
        'download_url': download_url,
        'is_doctor': False
    }
    return render(request, 'verify.html', context)


def verify_certificate_image(request, cert_id):
    try:
        cert = Certificate.objects.get(cert_id=cert_id)
    except Certificate.DoesNotExist:
        raise Http404("Sertifikat topilmadi")

    host_url, host2_url = get_hosts(request)
    base_path = getattr(settings, 'CERTIFICATE_BASE_PATH', '')
    template_path = cert.template or ''
    
    if 'new_templates/' in template_path:
        relative = 'new_templates/' + template_path.split('new_templates/')[-1]
        template_path = os.path.join(base_path, relative)
    elif template_path and not os.path.isabs(template_path):
        template_path = os.path.join(base_path, template_path)
    elif not template_path:
        template_path = os.path.join(base_path, 'new_templates', 'computer_science.jpg')

    template = cv2.imread(template_path)
    if template is None:
        return HttpResponse("Shablon fayl topilmadi", status=500)

    # Matnlar
    cv2.putText(template, cert.full_name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
    cv2.putText(template, cert.cert_id.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
    cv2.putText(template, cert.date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

    # QR code
    clean_cert_id = cert_id.strip().replace(':', '-')
    qr_data = f"{host_url}{clean_cert_id}/"
    qr_img = generate_qr_code(qr_data, size=900)
    x_offset = template.shape[1] - qr_img.shape[1] - 4500
    y_offset = template.shape[0] - qr_img.shape[0] - 800

    if x_offset >= 0 and y_offset >= 0:
        template[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

    is_success, buffer = cv2.imencode(".jpg", template)
    if not is_success:
        return HttpResponse("Sertifikat yaratishda xatolik", status=500)

    response = HttpResponse(buffer.tobytes(), content_type="image/jpeg")
    if request.GET.get('download') == 'true':
        response["Content-Disposition"] = f"attachment; filename={cert.cert_id}.jpg"
    else:
        response["Content-Disposition"] = f"inline; filename={cert.cert_id}.jpg"
    return response


def verify_certificate_doctors(request, cert_id):
    try:
        cert = Certificate.objects.get(cert_id=cert_id)
    except Certificate.DoesNotExist:
        raise Http404("Sertifikat topilmadi")

    course_name = get_uzbek_course_name("doctor")
    image_url = f"/sertifikat/doctors/verify-certificate/{cert_id}/image/"
    download_url = f"/sertifikat/doctors/verify-certificate/{cert_id}/image/?download=true"

    context = {
        'cert': cert,
        'course_name': course_name,
        'image_url': image_url,
        'download_url': download_url,
        'is_doctor': True
    }
    return render(request, 'verify.html', context)


def verify_certificate_doctors_image(request, cert_id):
    try:
        cert = Certificate.objects.get(cert_id=cert_id)
    except Certificate.DoesNotExist:
        raise Http404("Sertifikat topilmadi")

    host_url, host2_url = get_hosts(request)
    base_path = getattr(settings, 'CERTIFICATE_BASE_PATH', '')
    template_path = os.path.join(base_path, "new_templates/doctor.png")
    template = cv2.imread(template_path)

    if template is None:
        return HttpResponse("Shablon fayl topilmadi yoki yaroqsiz", status=500)

    # Matnlarni joylashtirish
    cv2.putText(template, cert.full_name.strip(), (700, 1205), cv2.FONT_HERSHEY_COMPLEX, 6, (0, 0, 0), 4, cv2.LINE_8)
    cv2.putText(template, cert.cert_id.strip(), (2030, 2125), cv2.FONT_HERSHEY_TRIPLEX, 3, (0, 0, 0), 2, cv2.LINE_AA)
    cv2.putText(template, cert.date.strip(), (1340, 1650), cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)

    # QR kod yaratish va joylashtirish
    qr_data = f"{host2_url}{cert.cert_id.strip().replace(':', '-')}/"
    qr_img = generate_qr_code(qr_data, size=400)

    x_offset = template.shape[1] - qr_img.shape[1] - 200
    y_offset = template.shape[0] - qr_img.shape[0] - 2000

    if x_offset < 0 or y_offset < 0:
        return HttpResponse("QR kodni joylashtirib bo‘lmadi — rasm o‘lchami kichik", status=500)

    template[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

    is_success, buffer = cv2.imencode(".jpg", template)
    if not is_success:
        return HttpResponse("Sertifikat yaratishda xatolik", status=500)

    response = HttpResponse(buffer.tobytes(), content_type="image/jpeg")
    if request.GET.get('download') == 'true':
        response["Content-Disposition"] = f"attachment; filename={cert.cert_id}.jpg"
    else:
        response["Content-Disposition"] = f"inline; filename={cert.cert_id}.jpg"
    return response



def generate_certificates_view(request, data_func, template_file, zip_filename, temp_folder_name):
    host_url, host2_url = get_hosts(request)
    temp_folder = os.path.join(settings.MEDIA_ROOT, temp_folder_name)
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, zip_filename)
    if os.path.exists(zip_path):
        os.remove(zip_path)

    data = data_func()
    for name, index, date, template in data:
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index,
            defaults={
                'full_name': name.strip(),
                'date': date.strip(),
                'template': template
            }
        )

        img = cv2.imread(template_file)
        if img is None:
            continue  # rasmlar noto‘g‘ri bo‘lsa o‘tkazib yuboriladi

        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index, (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        qr_data = f"{host_url}{index}/"
        qr_img = generate_qr_code(qr_data, size=900)
        x_offset = img.shape[1] - qr_img.shape[1] - 4500
        y_offset = img.shape[0] - qr_img.shape[0] - 800
        img[y_offset:y_offset + qr_img.shape[0], x_offset:x_offset + qr_img.shape[1]] = qr_img

        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)
        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)

    # ZIP faylni yuborish uchun streaming response
    file_handle = open(zip_path, 'rb')
    response = StreamingHttpResponse(FileWrapper(file_handle), content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{zip_filename}"'

    # Fayl yuborilganidan so‘ng o‘chirish uchun `close` hook
    def cleanup(path, fh):
        def closer():
            try:
                fh.close()
                os.remove(path)
                print(f"{path} muvaffaqiyatli o‘chirildi.")
            except Exception as e:
                print(f"Xatolik faylni o‘chirishda: {e}")
        return closer

    response.close = cleanup(zip_path, file_handle)

    return response


def generate_certificates_view2(request, data_func, template_file, zip_filename, temp_folder_name):
    host_url, host2_url = get_hosts(request)
    temp_folder = os.path.join(settings.MEDIA_ROOT, temp_folder_name)
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, zip_filename)
    if os.path.exists(zip_path):
        os.remove(zip_path)

    data = data_func()
    for name, index, date, template in data:
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index,
            defaults={
                'full_name': name.strip(),
                'date': date.strip(),
                'template': template
            }
        )

        img = cv2.imread(template_file)
        if img is None:
            continue  # rasmlar noto‘g‘ri bo‘lsa o‘tkazib yuboriladi

        cv2.putText(img, name.center(31), (000, 1190), cv2.FONT_HERSHEY_COMPLEX, 6, (0, 0, 0), 4, cv2.LINE_8)
        cv2.putText(img, index, (2090, 2125), cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (1340, 1650), cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)

        qr_data = f"{host2_url}{index}/"
        qr_img = generate_qr_code(qr_data, size=400)
        x_offset = img.shape[1] - qr_img.shape[1] - 200
        y_offset = img.shape[0] - qr_img.shape[0] - 2000
        img[y_offset:y_offset + qr_img.shape[0], x_offset:x_offset + qr_img.shape[1]] = qr_img

        resized_img = cv2.resize(img, (0, 0), fx=1, fy=1)
        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)

    # ZIP faylni yuborish uchun streaming response
    file_handle = open(zip_path, 'rb')
    response = StreamingHttpResponse(FileWrapper(file_handle), content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{zip_filename}"'

    # Fayl yuborilganidan so‘ng o‘chirish uchun `close` hook
    def cleanup(path, fh):
        def closer():
            try:
                fh.close()
                os.remove(path)
                print(f"{path} muvaffaqiyatli o‘chirildi.")
            except Exception as e:
                print(f"Xatolik faylni o‘chirishda: {e}")
        return closer

    response.close = cleanup(zip_path, file_handle)

    return response

def generate_view2(request, key):
    data, template, zip_name, temp_folder = get_data_by_key(key)
    return generate_certificates_view2(request, lambda: data, template, zip_name, temp_folder)


def doctor_view(request): return generate_view2(request, "doctor_data")


def generate_view(request, key):
    data, template, zip_name, temp_folder = get_data_by_key(key)
    return generate_certificates_view(request, lambda: data, template, zip_name, temp_folder)




def ks_view(request): return generate_view(request, "ks")
def photoshop_view(request): return generate_view(request, "photo")
def admin_view(request): return generate_view(request, "admin")
def web_design_view(request): return generate_view(request, "web")
def web_programming_view(request): return generate_view(request, "webprogram")
def pyhton_backend_view(request): return generate_view(request, "py")
def graphick_3d_interior_view(request): return generate_view(request, "max3d_int")
def graphick_3d_exterior_view(request): return generate_view(request, "max3d_ext")
def graphick_3d_modeling_view(request): return generate_view(request, "max3d_mod")
def graphick_3d_max_view(request): return generate_view(request, "max3d")
def word_view(request): return generate_view(request, "word_data")

