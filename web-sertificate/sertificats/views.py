from django.http import HttpResponse, FileResponse, Http404, StreamingHttpResponse
import os
import cv2
from data.name import (photo, py, web, admin, ks, webprogram, max3d,
                       word_data, max3d_int, max3d_ext, max3d_mod)
import zipfile
import qrcode
import numpy as np

from django.conf import settings

from .models import Certificate

PATH = "/home/uchyoshlar/sertificats/"
HOST = 'https://uchyoshlar.pythonanywhere.com/' + 'sertifikat/verify-certificate/'

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

    # Template sertifikat rasmi
    template = cv2.imread(f"{PATH}new_templates/computer_science.jpg")

    # Matnlar
    cv2.putText(template, cert.full_name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
    cv2.putText(template, cert.cert_id.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
    cv2.putText(template, cert.date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

    # QR code
    clean_cert_id = cert_id.strip().replace(':', '-')
    qr_data = f"{HOST}{clean_cert_id}/"
    qr_img = generate_qr_code(qr_data, size=1200)
    # x_offset = template.shape[1] - qr_img.shape[1] - 100
    # y_offset = template.shape[0] - qr_img.shape[0] - 100
    x_offset = template.shape[1] - qr_img.shape[1] - 4000
    y_offset = template.shape[0] - qr_img.shape[0] - 500

    template[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

    # Sertifikatni JPG formatga kodlash va yuborish
    is_success, buffer = cv2.imencode(".jpg", template)
    if not is_success:
        return HttpResponse("Sertifikat yaratishda xatolik", status=500)

    response = HttpResponse(buffer.tobytes(), content_type="image/jpeg")
    response["Content-Disposition"] = f"attachment; filename={cert.cert_id}.jpg"
    return response


def ks_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_ks_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "ks_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = ks()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/computer_science.jpg")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # # ZIP qilish
    # with zipfile.ZipFile(zip_path, "w") as zipf:
    #     for file_name in os.listdir(temp_folder):
    #         full_path = os.path.join(temp_folder, file_name)
    #         zipf.write(full_path, arcname=file_name)

    # # Tozalash
    # for f in os.listdir(temp_folder):
    #     os.remove(os.path.join(temp_folder, f))
    # os.rmdir(temp_folder)
    # return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="KS_certificates.zip")

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Temp fayllarni tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)

    # ZIP faylni o'qish va yuborish
    zip_file = open(zip_path, 'rb')

    def file_iterator(file, chunk_size=8192):
        try:
            while chunk := file.read(chunk_size):
                yield chunk
        finally:
            file.close()
            os.remove(zip_path)  # Fayl yuborilgandan keyin o'chirilsin

    response = StreamingHttpResponse(file_iterator(zip_file), content_type='application/zip')
    response['Content-Disposition'] = 'attachment; filename="KS_certificates.zip"'
    return response


def photoshop_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_photo_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "photoshop_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = photo()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/grafik_design.jpg")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="photoshop_certificates.zip")


def admin_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_admin_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "admin_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = admin()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/admin.jpg")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="admin_certificates.zip")


def web_design_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_web_design_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "web_design_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = web()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/web_design.jpg")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="web_design_certificates.zip")


def web_programming_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_web_prog_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "web_programming_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = webprogram()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/front_end.jpg")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="web_programming_certificates.zip")


def pyhton_backend_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_py_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "py_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = py()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/python.jpg")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="Python_programming_certificates.zip")


def graphick_3d_interior_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_3dint_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "3dint_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = max3d_int()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/max3D_int.png")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="max3Dint_certificates.zip")


def graphick_3d_exterior_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_3dext_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "3dext_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = max3d_ext()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/max3D_ext.png")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="max3Dext_certificates.zip")


def graphick_3d_modeling_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_3dmod_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "3dmod_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = max3d_mod()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/max3D_mod.png")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="max3Dmod_certificates.zip")


def graphick_3d_max_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_3dint_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "3dint_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = max3d()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/3dmax.jpg")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="max3D_certificates.zip")


def word_view(request):
    temp_folder = os.path.join(settings.MEDIA_ROOT, "temp_word_certificates")
    os.makedirs(temp_folder, exist_ok=True)

    zip_path = os.path.join(settings.MEDIA_ROOT, "word_certificates.zip")
    if os.path.exists(zip_path):
        os.remove(zip_path)
    a = word_data()
    for i in a:
        name, index, date = i
        index = index.strip().replace(': ', '-')

        Certificate.objects.get_or_create(
            cert_id=index.strip(),
            defaults={
                'full_name': name.strip(),
                'date': date.strip()
            }
        )
        img = cv2.imread(f"{PATH}new_templates/ms_word.png")
        cv2.putText(img, name.strip(), (700, 4100), cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(img, index.strip(), (7700, 5850), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(img, date.strip(), (7700, 6450), cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)

        # QR Code
        qr_data = f"{HOST}{index.strip()}/"  # Bu yerda real link bo'lishi kerak
        qr_img = generate_qr_code(qr_data, size=1200)

        # QR joylash (pastki o‘ng)
        x_offset = img.shape[1] - qr_img.shape[1] - 4000
        y_offset = img.shape[0] - qr_img.shape[0] - 500
        img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img

        # Kichraytirish
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)

        filename = f"ID_{index[3:]}_{name.strip().replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])

    # ZIP qilish
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)

    # Tozalash
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    return FileResponse(open(zip_path, 'rb'), as_attachment=True, filename="Ms_word_certificates.zip")
