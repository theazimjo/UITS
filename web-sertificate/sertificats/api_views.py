"""
REST API views for certificate management.
These endpoints are consumed by the UITS frontend admin panel.
"""
import json
import base64
from django.http import JsonResponse, HttpResponse, Http404, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Certificate, Sertifikatlar
from .constants import SHEET_CONFIG
import cv2
import numpy as np
import qrcode
import os
import re
import datetime
import zipfile
from wsgiref.util import FileWrapper
from django.conf import settings


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


@require_http_methods(["GET"])
def api_courses(request):
    """Return list of available certificate courses/templates."""
    courses = []
    for key, (sheet_name, template, zip_name, folder) in SHEET_CONFIG.items():
        courses.append({
            'key': key,
            'name': sheet_name,
            'template': template,
            'zipName': zip_name,
        })
    return JsonResponse({'courses': courses})


@require_http_methods(["GET"])
def api_certificates_list(request):
    """Return all certificates from the database."""
    search = request.GET.get('search', '').strip()
    certs = Certificate.objects.all().order_by('-id')
    
    if search:
        certs = certs.filter(full_name__icontains=search) | certs.filter(cert_id__icontains=search)
    
    data = []
    for c in certs[:200]:  # Limit to 200 records
        data.append({
            'id': c.id,
            'fullName': c.full_name,
            'certId': c.cert_id,
            'date': c.date,
            'template': c.template or '',
        })
    
    return JsonResponse({
        'certificates': data,
        'total': Certificate.objects.count()
    })


@require_http_methods(["GET"])
def api_certificate_detail(request, cert_id):
    """Return a single certificate's data."""
    try:
        cert = Certificate.objects.get(cert_id=cert_id)
    except Certificate.DoesNotExist:
        return JsonResponse({'error': 'Sertifikat topilmadi'}, status=404)
    
    return JsonResponse({
        'id': cert.id,
        'fullName': cert.full_name,
        'certId': cert.cert_id,
        'date': cert.date,
        'template': cert.template or '',
    })


@require_http_methods(["GET"])
def api_certificate_image(request, cert_id):
    """Generate and return certificate image for preview/download."""
    try:
        cert = Certificate.objects.get(cert_id=cert_id)
    except Certificate.DoesNotExist:
        raise Http404("Sertifikat topilmadi")
    
    host_url, host2_url = get_hosts(request)
    base_path = getattr(settings, 'CERTIFICATE_BASE_PATH', '')
    
    # Determine template path — handle old PythonAnywhere paths from DB
    template_path = cert.template or ''
    
    # Extract relative path from old absolute paths (e.g. /home/uchyoshlar/sertificats/new_templates/x.jpg)
    if 'new_templates/' in template_path:
        relative = 'new_templates/' + template_path.split('new_templates/')[-1]
        template_path = os.path.join(base_path, relative)
    elif template_path and not os.path.isabs(template_path):
        template_path = os.path.join(base_path, template_path)
    elif not template_path:
        template_path = os.path.join(base_path, 'new_templates', 'computer_science.jpg')
    
    template = cv2.imread(template_path)
    if template is None:
        return HttpResponse(f"Shablon fayl topilmadi: {template_path}", status=500)
    
    # Check if it's a doctor certificate (smaller template)
    is_doctor = 'doctor' in (cert.template or '').lower()
    
    if is_doctor:
        cv2.putText(template, cert.full_name.strip().center(31), (0, 1190), 
                     cv2.FONT_HERSHEY_COMPLEX, 6, (0, 0, 0), 4, cv2.LINE_8)
        cv2.putText(template, cert.cert_id.strip(), (2090, 2125), 
                     cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
        cv2.putText(template, cert.date.strip(), (1340, 1650), 
                     cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
        
        qr_data = f"{host2_url}{cert.cert_id.strip().replace(':', '-')}/"
        qr_img = generate_qr_code(qr_data, size=400)
        x_offset = template.shape[1] - qr_img.shape[1] - 200
        y_offset = template.shape[0] - qr_img.shape[0] - 2000
    else:
        cv2.putText(template, cert.full_name.strip(), (700, 4100), 
                     cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
        cv2.putText(template, cert.cert_id.strip(), (7700, 5850), 
                     cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        cv2.putText(template, cert.date.strip(), (7700, 6450), 
                     cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
        
        qr_data = f"{host_url}{cert.cert_id.strip().replace(':', '-')}/"
        qr_img = generate_qr_code(qr_data, size=900)
        x_offset = template.shape[1] - qr_img.shape[1] - 4500
        y_offset = template.shape[0] - qr_img.shape[0] - 800
    
    if x_offset >= 0 and y_offset >= 0:
        template[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img
    
    # Check if download is requested
    if request.GET.get('download') == 'true':
        is_success, buffer = cv2.imencode(".jpg", template, [cv2.IMWRITE_JPEG_QUALITY, 95])
        if not is_success:
            return HttpResponse("Sertifikat yaratishda xatolik", status=500)
        response = HttpResponse(buffer.tobytes(), content_type="image/jpeg")
        response["Content-Disposition"] = f'attachment; filename="{cert.cert_id}.jpg"'
    else:
        # Resize for preview
        resized = cv2.resize(template, (0, 0), fx=0.3, fy=0.3)
        is_success, buffer = cv2.imencode(".jpg", resized, [cv2.IMWRITE_JPEG_QUALITY, 85])
        if not is_success:
            return HttpResponse("Sertifikat yaratishda xatolik", status=500)
        response = HttpResponse(buffer.tobytes(), content_type="image/jpeg")
    
    return response


@csrf_exempt
@require_http_methods(["POST"])
def api_certificate_create(request):
    """Create a single certificate manually."""
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': "Noto'g'ri JSON format"}, status=400)
    
    full_name = body.get('fullName', '').strip()
    cert_id = body.get('certId', '').strip()
    date = body.get('date', '').strip()
    template = body.get('template', '').strip()
    
    if not full_name or not cert_id or not date:
        return JsonResponse({'error': "fullName, certId va date majburiy"}, status=400)
    
    # Check if cert_id already exists
    if Certificate.objects.filter(cert_id=cert_id).exists():
        return JsonResponse({'error': f"'{cert_id}' raqamli sertifikat allaqachon mavjud"}, status=409)
    
    cert = Certificate.objects.create(
        full_name=full_name,
        cert_id=cert_id,
        date=date,
        template=template or None
    )
    
    return JsonResponse({
        'id': cert.id,
        'fullName': cert.full_name,
        'certId': cert.cert_id,
        'date': cert.date,
        'template': cert.template or '',
        'message': 'Sertifikat muvaffaqiyatli yaratildi'
    }, status=201)


@csrf_exempt
@require_http_methods(["DELETE"])
def api_certificate_delete(request, pk):
    """Delete a certificate by its primary key."""
    try:
        cert = Certificate.objects.get(pk=pk)
    except Certificate.DoesNotExist:
        return JsonResponse({'error': 'Sertifikat topilmadi'}, status=404)
    
    cert.delete()
    return JsonResponse({'message': "Sertifikat o'chirildi"})


@require_http_methods(["GET"])
def api_stats(request):
    """Return certificate statistics."""
    total = Certificate.objects.count()
    
    # Count by template type
    by_course = {}
    for key, (sheet_name, template, _, _) in SHEET_CONFIG.items():
        count = Certificate.objects.filter(template__icontains=template).count()
        if count > 0:
            by_course[sheet_name] = count
    
    return JsonResponse({
        'total': total,
        'byCourse': by_course
    })


def generate_next_cert_id():
    certs = Certificate.objects.filter(cert_id__startswith='ID-')
    max_num = 1000
    for c in certs:
        match = re.search(r'ID-(\d+)', c.cert_id)
        if match:
            try:
                num = int(match.group(1))
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    return f"ID-{max_num + 1:06d}"


@require_http_methods(["GET"])
def api_next_cert_id(request):
    """Return the next unique certificate ID."""
    return JsonResponse({'nextId': generate_next_cert_id()})



@csrf_exempt
@require_http_methods(["POST"])
def api_certificates_bulk_generate(request):
    """
    Bulk generate certificates for UITS CRM students.
    Saves certificates to the database and streams a ZIP file with images.
    """
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': "Noto'g'ri JSON format"}, status=400)
    
    students = body.get('students', [])
    course_key = body.get('courseKey', '').strip()
    date_str = body.get('date', '').strip()
    
    if not students or not course_key:
        return JsonResponse({'error': "students va courseKey majburiy"}, status=400)
        
    if course_key not in SHEET_CONFIG:
        return JsonResponse({'error': f"Kurs kaliti topilmadi: {course_key}"}, status=404)
        
    if not date_str:
        date_str = datetime.date.today().strftime('%d.%m.%Y')
        
    sheet_name, template_rel, zip_filename, temp_folder_name = SHEET_CONFIG[course_key]
    
    host_url, host2_url = get_hosts(request)
    base_path = getattr(settings, 'CERTIFICATE_BASE_PATH', '')
    template_path = os.path.join(base_path, template_rel)
    
    img_template = cv2.imread(template_path)
    if img_template is None:
        return JsonResponse({'error': f"Shablon fayl topilmadi: {template_path}"}, status=500)
        
    is_doctor = 'doctor' in course_key.lower()
    
    temp_folder = os.path.join(settings.MEDIA_ROOT, f"bulk_{temp_folder_name}")
    os.makedirs(temp_folder, exist_ok=True)
    # Oldingi urinish xato bilan to'xtab qolgan bo'lsa, undan qolgan
    # rasmlar shu safar tayyorlanayotgan ZIP-ga aralashib ketmasligi uchun
    # papkani har safar boshida tozalab olamiz.
    for stale_file in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, stale_file))

    zip_filename_clean = f"bulk_{zip_filename}"
    zip_path = os.path.join(settings.MEDIA_ROOT, zip_filename_clean)
    if os.path.exists(zip_path):
        os.remove(zip_path)
        
    for s in students:
        full_name = s.get('fullName', '').strip()
        if not full_name:
            continue

        # Agar bu o'quvchiga shu shablon bo'yicha sertifikat allaqachon
        # yaratilgan bo'lsa (masalan, oldingi urinish tarmoq xatosi bilan
        # tugagan bo'lsa-da serverda muvaffaqiyatli yaratilgan bo'lsa),
        # yangi dublikat yozuv yaratmasdan mavjudini qayta ishlatamiz.
        existing = Certificate.objects.filter(
            full_name=full_name, template=template_rel
        ).order_by('-id').first()

        if existing:
            cert_id = existing.cert_id
        else:
            cert_id = generate_next_cert_id()
            Certificate.objects.create(
                full_name=full_name,
                cert_id=cert_id,
                date=date_str,
                template=template_rel
            )

        # OpenCV Render
        img = img_template.copy()
        
        if is_doctor:
            cv2.putText(img, full_name.center(31), (0, 1190), 
                         cv2.FONT_HERSHEY_COMPLEX, 6, (0, 0, 0), 4, cv2.LINE_8)
            cv2.putText(img, cert_id, (2090, 2125), 
                         cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
            cv2.putText(img, date_str, (1340, 1650), 
                         cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
            
            qr_data = f"{host2_url}{cert_id.replace(':', '-')}/"
            qr_img = generate_qr_code(qr_data, size=400)
            x_offset = img.shape[1] - qr_img.shape[1] - 200
            y_offset = img.shape[0] - qr_img.shape[0] - 2000
        else:
            cv2.putText(img, full_name, (700, 4100), 
                         cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
            cv2.putText(img, cert_id, (7700, 5850), 
                         cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
            cv2.putText(img, date_str, (7700, 6450), 
                         cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
            
            qr_data = f"{host_url}{cert_id.replace(':', '-')}/"
            qr_img = generate_qr_code(qr_data, size=900)
            x_offset = img.shape[1] - qr_img.shape[1] - 4500
            y_offset = img.shape[0] - qr_img.shape[0] - 800
            
        if x_offset >= 0 and y_offset >= 0:
            img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img
            
        # Save to temp folder (resized)
        resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)
        filename = f"ID_{cert_id[3:]}_{full_name.replace(' ', '_')}.jpg"
        file_path = os.path.join(temp_folder, filename)
        cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])
        
    # Zip
    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file_name in os.listdir(temp_folder):
            full_path = os.path.join(temp_folder, file_name)
            zipf.write(full_path, arcname=file_name)
            
    # Cleanup temp folder
    for f in os.listdir(temp_folder):
        os.remove(os.path.join(temp_folder, f))
    os.rmdir(temp_folder)
    
    # Send ZIP file response
    file_handle = open(zip_path, 'rb')
    response = StreamingHttpResponse(FileWrapper(file_handle), content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{zip_filename_clean}"'
    
    def cleanup(path, fh):
        def closer():
            try:
                fh.close()
                os.remove(path)
            except Exception as e:
                print(f"Xatolik ZIP cleanupda: {e}")
        return closer
        
    response.close = cleanup(zip_path, file_handle)
    return response


@csrf_exempt
@require_http_methods(["POST"])
def api_certificates_bulk_preview(request):
    """
    Generate preview images for bulk certificates (does not save to database).
    Returns list of base64-encoded JPEGs.
    """
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': "Noto'g'ri JSON format"}, status=400)
    
    students = body.get('students', [])
    course_key = body.get('courseKey', '').strip()
    date_str = body.get('date', '').strip()
    
    if not students or not course_key:
        return JsonResponse({'error': "students va courseKey majburiy"}, status=400)
        
    if course_key not in SHEET_CONFIG:
        return JsonResponse({'error': f"Kurs kaliti topilmadi: {course_key}"}, status=404)
        
    if not date_str:
        date_str = datetime.date.today().strftime('%d.%m.%Y')
        
    sheet_name, template_rel, zip_filename, temp_folder_name = SHEET_CONFIG[course_key]
    
    host_url, host2_url = get_hosts(request)
    base_path = getattr(settings, 'CERTIFICATE_BASE_PATH', '')
    template_path = os.path.join(base_path, template_rel)
    
    img_template = cv2.imread(template_path)
    if img_template is None:
        return JsonResponse({'error': f"Shablon fayl topilmadi: {template_path}"}, status=500)
        
    is_doctor = 'doctor' in course_key.lower()
    
    # Calculate starting ID
    next_id_str = generate_next_cert_id()
    match = re.search(r'ID-(\d+)', next_id_str)
    start_num = 1001
    if match:
        start_num = int(match.group(1))
        
    previews = []
    for i, s in enumerate(students):
        full_name = s.get('fullName', '').strip()
        if not full_name:
            continue
            
        cert_id = f"ID-{start_num + i:06d}"
        
        # OpenCV Render
        img = img_template.copy()
        
        if is_doctor:
            cv2.putText(img, full_name.center(31), (0, 1190), 
                         cv2.FONT_HERSHEY_COMPLEX, 6, (0, 0, 0), 4, cv2.LINE_8)
            cv2.putText(img, cert_id, (2090, 2125), 
                         cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
            cv2.putText(img, date_str, (1340, 1650), 
                         cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
            
            qr_data = f"{host2_url}{cert_id.replace(':', '-')}/"
            qr_img = generate_qr_code(qr_data, size=400)
            x_offset = img.shape[1] - qr_img.shape[1] - 200
            y_offset = img.shape[0] - qr_img.shape[0] - 2000
        else:
            cv2.putText(img, full_name, (700, 4100), 
                         cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
            cv2.putText(img, cert_id, (7700, 5850), 
                         cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
            cv2.putText(img, date_str, (7700, 6450), 
                         cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
            
            qr_data = f"{host_url}{cert_id.replace(':', '-')}/"
            qr_img = generate_qr_code(qr_data, size=900)
            x_offset = img.shape[1] - qr_img.shape[1] - 4500
            y_offset = img.shape[0] - qr_img.shape[0] - 800
            
        if x_offset >= 0 and y_offset >= 0:
            img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img
            
        # Resize for preview
        # Keep aspect ratio for preview display
        h, w = img.shape[:2]
        new_w = 600
        new_h = int((h / w) * new_w)
        resized_img = cv2.resize(img, (new_w, new_h))
        
        _, buffer = cv2.imencode(".jpg", resized_img, [cv2.IMWRITE_JPEG_QUALITY, 80])
        b64_str = base64.b64encode(buffer).decode('utf-8')
        
        previews.append({
            'fullName': full_name,
            'certId': cert_id,
            'date': date_str,
            'imageData': f"data:image/jpeg;base64,{b64_str}"
        })
        
    return JsonResponse({'previews': previews})


@csrf_exempt
@require_http_methods(["POST"])
def api_certificates_download_zip(request):
    """
    Generate and stream a ZIP archive of existing certificates on-the-fly.
    """
    import time
    from wsgiref.util import FileWrapper
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': "Noto'g'ri JSON format"}, status=400)
    
    cert_ids = body.get('certIds', [])
    if not cert_ids:
        return JsonResponse({'error': "certIds majburiy"}, status=400)
        
    certs = Certificate.objects.filter(cert_id__in=cert_ids)
    if not certs.exists():
        return JsonResponse({'error': "Hech qanday sertifikat topilmadi"}, status=404)
        
    host_url, host2_url = get_hosts(request)
    base_path = getattr(settings, 'CERTIFICATE_BASE_PATH', '')
    
    temp_folder = os.path.join(settings.MEDIA_ROOT, f"bulk_download_{int(time.time())}")
    os.makedirs(temp_folder, exist_ok=True)
    
    zip_filename = f"re_certificates_{int(time.time())}.zip"
    zip_path = os.path.join(settings.MEDIA_ROOT, zip_filename)
    
    try:
        for cert in certs:
            template_rel = cert.template or 'new_templates/computer_science.jpg'
            template_path = os.path.join(base_path, template_rel)
            
            img_template = cv2.imread(template_path)
            if img_template is None:
                continue
                
            is_doctor = 'doctor' in template_rel.lower()
            img = img_template.copy()
            
            if is_doctor:
                cv2.putText(img, cert.full_name.strip().center(31), (0, 1190), 
                             cv2.FONT_HERSHEY_COMPLEX, 6, (0, 0, 0), 4, cv2.LINE_8)
                cv2.putText(img, cert.cert_id.strip(), (2090, 2125), 
                             cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
                cv2.putText(img, cert.date.strip(), (1340, 1650), 
                             cv2.FONT_HERSHEY_TRIPLEX, 2, (0, 0, 0), 2, cv2.LINE_AA)
                
                qr_data = f"{host2_url}{cert.cert_id.strip().replace(':', '-')}/"
                qr_img = generate_qr_code(qr_data, size=400)
                x_offset = img.shape[1] - qr_img.shape[1] - 200
                y_offset = img.shape[0] - qr_img.shape[0] - 2000
            else:
                cv2.putText(img, cert.full_name.strip(), (700, 4100), 
                             cv2.FONT_HERSHEY_COMPLEX, 14, (0, 0, 0), 10, cv2.LINE_8)
                cv2.putText(img, cert.cert_id.strip(), (7700, 5850), 
                             cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
                cv2.putText(img, cert.date.strip(), (7700, 6450), 
                             cv2.FONT_HERSHEY_TRIPLEX, 6, (0, 0, 0), 5, cv2.LINE_AA)
                
                qr_data = f"{host_url}{cert.cert_id.strip().replace(':', '-')}/"
                qr_img = generate_qr_code(qr_data, size=900)
                x_offset = img.shape[1] - qr_img.shape[1] - 4500
                y_offset = img.shape[0] - qr_img.shape[0] - 800
                
            if x_offset >= 0 and y_offset >= 0:
                img[y_offset:y_offset+qr_img.shape[0], x_offset:x_offset+qr_img.shape[1]] = qr_img
                
            resized_img = cv2.resize(img, (0, 0), fx=0.4, fy=0.4)
            filename = f"ID_{cert.cert_id[3:]}_{cert.full_name.replace(' ', '_')}.jpg"
            file_path = os.path.join(temp_folder, filename)
            cv2.imwrite(file_path, resized_img, [cv2.IMWRITE_JPEG_QUALITY, 70])
            
        with zipfile.ZipFile(zip_path, "w") as zipf:
            for file_name in os.listdir(temp_folder):
                full_path = os.path.join(temp_folder, file_name)
                zipf.write(full_path, arcname=file_name)
                
    finally:
        if os.path.exists(temp_folder):
            for f in os.listdir(temp_folder):
                try:
                    os.remove(os.path.join(temp_folder, f))
                except Exception:
                    pass
            try:
                os.rmdir(temp_folder)
            except Exception:
                pass
                
    file_handle = open(zip_path, 'rb')
    response = StreamingHttpResponse(FileWrapper(file_handle), content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="{zip_filename}"'
    
    def cleanup(path, fh):
        def closer():
            try:
                fh.close()
                os.remove(path)
            except Exception as e:
                print(f"Xatolik ZIP cleanupda: {e}")
        return closer
        
    response.close = cleanup(zip_path, file_handle)
    return response

