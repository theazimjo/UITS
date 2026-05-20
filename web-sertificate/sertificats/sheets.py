# certificates/sheets.py

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from .constants import SHEET_CONFIG, PATH

def get_client():
    scope = [
        "https://spreadsheets.google.com/feeds",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive"
    ]
    creds = ServiceAccountCredentials.from_json_keyfile_name(f"{PATH}data/main.json", scope)
    return gspread.authorize(creds)

def get_sheet_data(sheet, template):
    col2, col3, col4 = sheet.col_values(2), sheet.col_values(3), sheet.col_values(4)
    return [[col2[i], col3[i], col4[i], f"{PATH}{template}"] for i in range(len(col2))]

def get_data_by_key(key):
    client = get_client()
    sheets = client.open('newsert')
    sheet_name, template, zip_name, folder = SHEET_CONFIG[key]
    sheet = sheets.worksheet(sheet_name)
    data = get_sheet_data(sheet, template)
    return data, f"{PATH}{template}", zip_name, folder
