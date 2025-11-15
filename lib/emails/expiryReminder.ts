import { format } from 'date-fns';

interface Member {
  name: string;
  phone: string;
  membership_end: Date;
}

interface ExpiryReminderEmailProps {
  gymName: string;
  expiringSoon: Member[];
  expiredToday: Member[];
}

export function generateExpiryReminderEmail({
  gymName,
  expiringSoon,
  expiredToday,
}: ExpiryReminderEmailProps): string {
  const hasExpiringSoon = expiringSoon.length > 0;
  const hasExpiredToday = expiredToday.length > 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membership Expiry Reminder</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #a855f7;
    }
    .header h1 {
      color: #a855f7;
      margin: 0;
      font-size: 24px;
    }
    .gym-name {
      color: #666;
      font-size: 16px;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 4px;
    }
    .expiring-soon {
      background-color: #fef3c7;
      color: #92400e;
    }
    .expired-today {
      background-color: #fee2e2;
      color: #991b1b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #f9fafb;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover {
      background-color: #f9fafb;
    }
    .count-badge {
      display: inline-block;
      background-color: #a855f7;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: bold;
      margin-left: 10px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    .no-members {
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💪 Membership Expiry Reminder</h1>
      <div class="gym-name">${gymName}</div>
    </div>

    ${
      hasExpiredToday
        ? `
    <div class="section">
      <div class="section-title expired-today">
        ⚠️ Expired Today
        <span class="count-badge">${expiredToday.length}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Phone</th>
            <th>Expired On</th>
          </tr>
        </thead>
        <tbody>
          ${expiredToday
            .map(
              (member) => `
            <tr>
              <td><strong>${member.name}</strong></td>
              <td>${member.phone}</td>
              <td>${format(new Date(member.membership_end), 'dd MMM yyyy')}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      hasExpiringSoon
        ? `
    <div class="section">
      <div class="section-title expiring-soon">
        ⏰ Expiring Soon (Next 3 Days)
        <span class="count-badge">${expiringSoon.length}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Member Name</th>
            <th>Phone</th>
            <th>Expires On</th>
          </tr>
        </thead>
        <tbody>
          ${expiringSoon
            .map(
              (member) => `
            <tr>
              <td><strong>${member.name}</strong></td>
              <td>${member.phone}</td>
              <td>${format(new Date(member.membership_end), 'dd MMM yyyy')}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    ${
      !hasExpiringSoon && !hasExpiredToday
        ? `
    <div class="no-members">
      ✅ No memberships expiring in the next 3 days
    </div>
    `
        : ''
    }

    <div class="footer">
      <p>This is an automated reminder from your Swole Gym Management System.</p>
      <p>Please contact members to renew their memberships.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
