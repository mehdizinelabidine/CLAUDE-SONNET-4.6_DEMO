import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import * as PDFDocument from 'pdfkit';
import { StorageService } from '../storage/storage.service';
import { SummariesService } from '../summaries/summaries.service';
import { TimesheetEntry, User } from '../shared/interfaces';

@Injectable()
export class ReportsService {
  constructor(
    private readonly storage: StorageService,
    private readonly summaries: SummariesService,
  ) {}

  async generateCsv(from: string, to: string): Promise<string> {
    const entries = await this.storage.readTimesheets<TimesheetEntry>();
    const users = await this.storage.readUsers<User>();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const filtered = entries.filter((e) => e.date >= from && e.date <= to);

    const rows = filtered.map((e) => {
      const user = userMap.get(e.userId);
      return {
        Date: e.date,
        'Employee Name': user?.name ?? 'Unknown',
        Email: user?.email ?? '',
        Role: user?.role ?? '',
        Status: e.status.toUpperCase(),
        'Submitted At': e.createdAt,
      };
    });

    rows.sort((a, b) => a.Date.localeCompare(b.Date));

    return stringify(rows, { header: true });
  }

  async generatePdf(from: string, to: string): Promise<Buffer> {
    const dashboard = await this.summaries.getAdminDashboard(from, to);
    const entries = await this.storage.readTimesheets<TimesheetEntry>();
    const users = await this.storage.readUsers<User>();
    const userMap = new Map(users.map((u) => [u.id, u]));

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .fillColor('#111111')
        .text('Timesheet Report', { align: 'center' });
      doc
        .fontSize(11)
        .fillColor('#555555')
        .text(`Period: ${from} → ${to}`, { align: 'center' });
      doc.moveDown();

      // Summary KPIs
      doc.fontSize(13).fillColor('#111111').text('Summary');
      doc
        .fontSize(10)
        .fillColor('#333333')
        .text(
          `Total On-Site: ${dashboard.summary.totalOnsite}   |   Total WFH: ${dashboard.summary.totalWfh}   |   Total Leave: ${dashboard.summary.totalLeave}`,
        )
        .text(`Days with violations: ${dashboard.totalViolationDays}`);
      doc.moveDown();

      // Daily table
      doc.fontSize(13).fillColor('#111111').text('Daily Breakdown');
      doc.moveDown(0.3);

      const colX = [40, 130, 210, 285, 360];
      const headers = ['Date', 'On-Site', 'WFH', 'Leave', 'Violations'];

      // Header row
      doc.fontSize(9).fillColor('#FFFFFF');
      doc.rect(40, doc.y, 520, 16).fill('#1C1C2E');
      headers.forEach((h, i) => {
        doc.fillColor('#FFFFFF').text(h, colX[i] + 3, doc.y - 14, { width: 80 });
      });
      doc.moveDown(0.5);

      // Data rows
      dashboard.days.forEach((day, idx) => {
        const rowY = doc.y;
        const bg = idx % 2 === 0 ? '#F7F7F7' : '#FFFFFF';
        const hasViolation = day.violations.length > 0;

        doc.rect(40, rowY, 520, 16).fill(hasViolation ? '#FFF3CD' : bg);
        doc.fillColor('#222222').fontSize(9);
        doc.text(day.date, colX[0] + 3, rowY + 3, { width: 80 });
        doc.text(String(day.onsiteCount), colX[1] + 3, rowY + 3, { width: 70 });
        doc.text(String(day.wfhCount), colX[2] + 3, rowY + 3, { width: 70 });
        doc.text(String(day.leaveCount), colX[3] + 3, rowY + 3, { width: 70 });
        doc.text(
          hasViolation ? '⚠ Below min' : '✓',
          colX[4] + 3,
          rowY + 3,
          { width: 120 },
        );
        doc.moveDown(0.3);

        if (doc.y > 750) doc.addPage();
      });

      doc.end();
    });
  }
}
