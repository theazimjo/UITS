import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
import { SettingsService } from '../settings/settings.service';
import { FinanceService } from '../finance/finance.service';

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private readonly SERVICE_ACCOUNT_PATH = path.join(process.cwd(), 'config', 'google-service-account.json');

  constructor(
    @Inject(forwardRef(() => SettingsService))
    private readonly settingsService: SettingsService,
    @Inject(forwardRef(() => FinanceService))
    private readonly financeService: FinanceService,
  ) { }

  private async getAuth() {
    if (!fs.existsSync(this.SERVICE_ACCOUNT_PATH)) {
      throw new Error('Google Service Account JSON fayli topilmadi (/config/google-service-account.json)');
    }
    return new google.auth.GoogleAuth({
      keyFile: this.SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async syncAll() {
    const settings = await this.settingsService.getSettings();
    const spreadsheetId = settings?.googleSheetsId;

    if (!spreadsheetId) {
      throw new Error('Google Spreadsheet ID sozlanmagan');
    }

    const auth = await this.getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    this.logger.log(`Starting Google Sheets sync for ID: ${spreadsheetId}`);

    // Fetch data
    const transactions = await this.financeService.getTransactions() as any[];

    // Separate data
    const payments = transactions.filter(t => t.id.startsWith('inc_'));
    const otherIncomes = transactions.filter(t => t.id.startsWith('oinc_'));
    const expenses = transactions.filter(t => t.id.startsWith('staff_') || t.id.startsWith('gen_'));

    // Prepare Sheets
    await this.ensureSheetExists(sheets, spreadsheetId, "To'lovlar");
    await this.ensureSheetExists(sheets, spreadsheetId, "Tushumlar");
    await this.ensureSheetExists(sheets, spreadsheetId, "Xarajatlar");

    // 1. To'lovlar (Student Payments)
    const paymentRows = [
      ["ID", "Sana", "Talaba", "Kurs/Guruh", "Summa", "To'lov turi", "Oy"],
      ...payments.map(p => [p.id, p.date, p.title.replace("Talaba to'lovi: ", ""), p.category, p.amount, p.paymentType, ""])
    ];
    await this.updateSheet(sheets, spreadsheetId, "To'lovlar", paymentRows);

    // 2. Tushumlar (Other Incomes)
    const incomeRows = [
      ["ID", "Sana", "Nomi", "Kategoriya", "Summa", "To'lov turi", "Izoh"],
      ...otherIncomes.map(i => [i.id, i.date, i.title, i.category, i.amount, i.paymentType, i.comment || ""])
    ];
    await this.updateSheet(sheets, spreadsheetId, "Tushumlar", incomeRows);

    // 3. Xarajatlar (Staff + General Expenses)
    const expenseRows = [
      ["ID", "Sana", "Nomi", "Kategoriya", "Summa", "To'lov turi", "Izoh"],
      ...expenses.map(e => [e.id, e.date, e.title, e.category, e.amount, e.paymentType, e.comment || ""])
    ];
    await this.updateSheet(sheets, spreadsheetId, "Xarajatlar", expenseRows);

    this.logger.log(`Google Sheets sync completed successfully`);
    return { success: true };
  }

  private async ensureSheetExists(sheets: any, spreadsheetId: string, title: string) {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = res.data.sheets.some((s: any) => s.properties.title === title);

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title } } }]
        }
      });
    }
  }

  private async updateSheet(sheets: any, spreadsheetId: string, title: string, rows: any[][]) {
    // Clear old data first
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${title}!A1:Z10000`,
    });

    // Update with new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${title}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: rows },
    });
  }
}
