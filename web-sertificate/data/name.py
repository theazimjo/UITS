import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREDS_PATH = os.path.join(BASE_DIR, 'data', 'main.json')

scope = ["https://spreadsheets.google.com/feeds",'https://www.googleapis.com/auth/spreadsheets',
         "https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(CREDS_PATH, scope)

client = gspread.authorize(creds)

sheets = client.open('newsert')
kssheet = sheets.worksheet('Ks')
wordsheet = sheets.worksheet('Word')

photosheet = sheets.worksheet('Photo')
adminsheet = sheets.worksheet('Admin')

websheet = sheets.worksheet('Web')
webprosheet = sheets.worksheet('Web_react')

pysheet = sheets.worksheet('Py')

max3dsheet = sheets.worksheet('max3d')
max3dsheetint = sheets.worksheet('max3d_int')
max3dsheetext = sheets.worksheet('max3d_ext')
max3dsheetmod = sheets.worksheet('max3d_mod')

def ks():
    name_sname = kssheet.col_values(2)
    ser_num = kssheet.col_values(3)
    data = kssheet.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def admin():
    name_sname = adminsheet.col_values(2)
    ser_num = adminsheet.col_values(3)
    data = adminsheet.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def photo():
    name_sname = photosheet.col_values(2)
    ser_num = photosheet.col_values(3)
    data = photosheet.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def web():
    name_sname = websheet.col_values(2)
    ser_num = websheet.col_values(3)
    data = websheet.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def webprogram():
    name_sname = webprosheet.col_values(2)
    ser_num = webprosheet.col_values(3)
    data = webprosheet.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def py():
    name_sname = pysheet.col_values(2)
    ser_num = pysheet.col_values(3)
    data = pysheet.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def max3d():
    name_sname = max3dsheet.col_values(2)
    ser_num = max3dsheet.col_values(3)
    data = max3dsheet.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def max3d_int():
    name_sname = max3dsheetint.col_values(2)
    ser_num = max3dsheetint.col_values(3)
    data = max3dsheetint.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def max3d_ext():
    name_sname = max3dsheetext.col_values(2)
    ser_num = max3dsheetext.col_values(3)
    data = max3dsheetext.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def max3d_mod():
    name_sname = max3dsheetmod.col_values(2)
    ser_num = max3dsheetmod.col_values(3)
    data = max3dsheetmod.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student

def word_data():
    name_sname = wordsheet.col_values(2)
    ser_num = wordsheet.col_values(3)
    data = wordsheet.col_values(4)
    data_student = []
    for i in range(len(name_sname)):
        data_student.append([name_sname[i],ser_num[i],data[i]])
    return data_student
