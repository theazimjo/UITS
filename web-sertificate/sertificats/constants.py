# certificates/constants.py
from django.conf import settings

PATH = getattr(settings, 'CERTIFICATE_BASE_PATH', str(settings.BASE_DIR) + '/')

SHEET_CONFIG = {
    "ks": ("Ks", "new_templates/computer_science.jpg", "computer_science_certificates.zip", "temp_photo_certificates"),
    "photo": ("Photo", "new_templates/grafik_design.jpg", "photoshop_certificates.zip", "temp_photo_certificates"),
    "admin": ("Admin", "new_templates/admin.jpg", "admin_certificates.zip", "temp_admin_certificates"),
    "web": ("Web", "new_templates/web_design.jpg", "web_design_certificates.zip", "temp_web_design_certificates"),
    "webprogram": ("Web_react", "new_templates/front_end.jpg", "web_programming_certificates.zip", "temp_web_prog_certificates"),
    "py": ("Py", "new_templates/python.jpg", "py_certificates.zip", "temp_py_certificates"),
    "max3d_int": ("max3d_int", "new_templates/max3D_int.png", "3dint_certificates.zip", "temp_3dint_certificates"),
    "max3d_ext": ("max3d_ext", "new_templates/max3D_ext.png", "3dext_certificates.zip", "temp_3dext_certificates"),
    "max3d_mod": ("max3d_mod", "new_templates/max3D_mod.png", "3dmod_certificates.zip", "temp_3dmod_certificates"),
    "max3d": ("max3d", "new_templates/3dmax.jpg", "max3D_certificates.zip", "temp_3dint_certificates"),
    "word_data": ("Word", "new_templates/ms_word.png", "word_certificates.zip", "temp_word_certificates"),
    "doctor_data": ("doctor", "new_templates/doctor.png", "doctor_certificates.zip", "temp_doctor_certificates"),

}
