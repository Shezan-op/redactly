import type { WatermarkConfig } from './types';

export interface WatermarkPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<WatermarkConfig>;
}

export const WATERMARK_PRESETS: WatermarkPreset[] = [
  {
    id: 'confidential',
    name: 'Confidential',
    description: 'Large diagonal banner with low opacity',
    config: {
      enabled: true,
      text: 'CONFIDENTIAL',
      fontFamily: 'Inter',
      fontSize: 48,
      fontWeight: '900',
      color: '#ffffff',
      opacity: 0.25,
      rotation: -30,
      layoutMode: 'diagonal',
      positionPreset: 'center',
      shadow: true,
    },
  },
  {
    id: 'draft',
    name: 'Draft',
    description: 'Prominent centered mark with medium opacity',
    config: {
      enabled: true,
      text: 'DRAFT - NOT FINAL',
      fontFamily: 'Inter',
      fontSize: 42,
      fontWeight: '700',
      color: '#d4d4d8',
      opacity: 0.35,
      rotation: -15,
      layoutMode: 'center',
      positionPreset: 'center',
      shadow: false,
    },
  },
  {
    id: 'client-copy',
    name: 'Client Copy',
    description: 'Professional bottom-right identification',
    config: {
      enabled: true,
      text: 'CLIENT REVIEW COPY',
      fontFamily: 'Inter',
      fontSize: 22,
      fontWeight: '600',
      color: '#ffffff',
      opacity: 0.7,
      rotation: 0,
      layoutMode: 'single',
      positionPreset: 'bottom-right',
      shadow: true,
    },
  },
  {
    id: 'internal',
    name: 'Internal Only',
    description: 'Tiled repeating security pattern',
    config: {
      enabled: true,
      text: 'INTERNAL USE ONLY',
      fontFamily: 'Inter',
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
      opacity: 0.16,
      rotation: -25,
      layoutMode: 'repeated',
      positionPreset: 'center',
      spacingX: 140,
      spacingY: 100,
      shadow: false,
    },
  },
  {
    id: 'proof',
    name: 'Proof',
    description: 'Diagonal sample proof stamp',
    config: {
      enabled: true,
      text: 'SAMPLE PROOF',
      fontFamily: 'Impact',
      fontSize: 52,
      fontWeight: '900',
      color: '#f59e0b',
      opacity: 0.35,
      rotation: -45,
      layoutMode: 'diagonal',
      positionPreset: 'center',
      shadow: true,
    },
  },
  {
    id: 'do-not-distribute',
    name: 'Do Not Share',
    description: 'Top secret warning mark',
    config: {
      enabled: true,
      text: 'DO NOT DISTRIBUTE',
      fontFamily: 'JetBrains Mono',
      fontSize: 32,
      fontWeight: '700',
      color: '#ef4444',
      opacity: 0.5,
      rotation: 0,
      layoutMode: 'single',
      positionPreset: 'top-right',
      shadow: true,
    },
  },
];

/**
 * Creates high resolution realistic sample screenshots for instant browser demo/testing.
 */
export function generateSampleImage(
  type: 'dashboard' | 'invoice' | 'chat' | 'code'
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 800;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    if (type === 'dashboard') {
      // 1. Charcoal SaaS Dashboard Screenshot
      ctx.fillStyle = '#0a0b0d';
      ctx.fillRect(0, 0, width, height);

      // Sidebar
      ctx.fillStyle = '#121317';
      ctx.fillRect(0, 0, 240, height);

      // Logo
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(24, 28, 36, 36, 8);
      ctx.fill();
      ctx.fillStyle = '#0a0b0d';
      ctx.font = 'bold 20px Inter';
      ctx.fillText('R', 35, 54);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Inter';
      ctx.fillText('Redactly Studio', 72, 53);

      // Sidebar items
      const navs = ['Overview', 'Customers', 'Billing & Invoices', 'API Keys', 'Settings'];
      navs.forEach((item, idx) => {
        ctx.fillStyle = idx === 0 ? '#1f2129' : 'transparent';
        ctx.beginPath();
        ctx.roundRect(16, 100 + idx * 48, 208, 38, 6);
        ctx.fill();

        ctx.fillStyle = idx === 0 ? '#ffffff' : '#858895';
        ctx.font = '500 15px Inter';
        ctx.fillText(item, 36, 124 + idx * 48);
      });

      // User account at bottom
      ctx.fillStyle = '#22242d';
      ctx.beginPath();
      ctx.arc(42, 740, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 14px Inter';
      ctx.fillText('Alex Vance', 70, 735);
      ctx.fillStyle = '#858895';
      ctx.font = '400 12px Inter';
      ctx.fillText('alex.vance@company.com', 70, 755);

      // Main content header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter';
      ctx.fillText('Executive Performance & Revenue', 280, 54);

      // Metric Cards
      const metrics = [
        { label: 'Monthly Recurring Revenue', val: '$148,920.00', sub: '+18.4% vs last month' },
        { label: 'Active Enterprise Clients', val: '438 Accounts', sub: '98.2% retention' },
        { label: 'Confidential Net Profit', val: '$84,310.00', sub: 'Margin: 56.6%' },
      ];

      metrics.forEach((m, idx) => {
        const cx = 280 + idx * 296;
        ctx.fillStyle = '#131418';
        ctx.beginPath();
        ctx.roundRect(cx, 90, 276, 110, 12);
        ctx.fill();

        ctx.fillStyle = '#858895';
        ctx.font = '500 13px Inter';
        ctx.fillText(m.label, cx + 18, 120);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Inter';
        ctx.fillText(m.val, cx + 18, 156);

        ctx.fillStyle = '#10b981';
        ctx.font = '500 12px Inter';
        ctx.fillText(m.sub, cx + 18, 182);
      });

      // Customer Table Card
      ctx.fillStyle = '#131418';
      ctx.beginPath();
      ctx.roundRect(280, 230, 888, 530, 12);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 17px Inter';
      ctx.fillText('Recent Customer Transactions & Private Data', 305, 270);

      // Table Header
      ctx.fillStyle = '#1e2027';
      ctx.fillRect(305, 295, 838, 36);
      ctx.fillStyle = '#858895';
      ctx.font = '600 13px Inter';
      ctx.fillText('CLIENT NAME', 320, 318);
      ctx.fillText('CONTACT EMAIL', 480, 318);
      ctx.fillText('PHONE NUMBER', 700, 318);
      ctx.fillText('AMOUNT', 890, 318);
      ctx.fillText('PAYMENT METHOD', 1010, 318);

      // Rows
      const rows = [
        { name: 'Sarah Jenkins', email: 'sarah.j@acmecorp.com', phone: '+1 (415) 555-0192', amt: '$4,250.00', card: 'Visa **** 4921' },
        { name: 'Marcus Sterling', email: 'm.sterling@globex.io', phone: '+1 (212) 555-8831', amt: '$12,800.00', card: 'MasterCard **** 8102' },
        { name: 'Elena Rostova', email: 'elena@novatech.ch', phone: '+41 79 555 3829', amt: '$9,400.00', card: 'Amex **** 1094' },
        { name: 'David Chen', email: 'dchen@apexsystems.com', phone: '+1 (408) 555-7721', amt: '$6,150.00', card: 'Wire Transfer' },
        { name: 'Claire Dupont', email: 'claire.dupont@luxe.fr', phone: '+33 6 55 53 18 90', amt: '$15,000.00', card: 'Visa **** 3319' },
        { name: 'Robert Tanaka', email: 'r.tanaka@tokyomedia.jp', phone: '+81 90 5555 4412', amt: '$8,900.00', card: 'MasterCard **** 7741' },
      ];

      rows.forEach((r, idx) => {
        const ry = 365 + idx * 56;
        ctx.fillStyle = idx % 2 === 0 ? '#131418' : '#101115';
        ctx.fillRect(305, ry - 25, 838, 48);

        ctx.fillStyle = '#ffffff';
        ctx.font = '500 14px Inter';
        ctx.fillText(r.name, 320, ry);

        ctx.fillStyle = '#858895';
        ctx.fillText(r.email, 480, ry);
        ctx.fillText(r.phone, 700, ry);

        ctx.fillStyle = '#10b981';
        ctx.font = '600 14px Inter';
        ctx.fillText(r.amt, 890, ry);

        ctx.fillStyle = '#858895';
        ctx.font = '400 13px Inter';
        ctx.fillText(r.card, 1010, ry);
      });

    } else if (type === 'invoice') {
      // 2. Client Invoice & Banking Details
      ctx.fillStyle = '#101114';
      ctx.fillRect(0, 0, width, height);

      // Paper Container
      ctx.fillStyle = '#18191f';
      ctx.beginPath();
      ctx.roundRect(160, 40, 880, 720, 12);
      ctx.fill();
      ctx.strokeStyle = '#272933';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Inter';
      ctx.fillText('TAX INVOICE', 210, 100);

      ctx.fillStyle = '#858895';
      ctx.font = '500 14px Inter';
      ctx.fillText('Invoice #: INV-2026-8941', 210, 130);
      ctx.fillText('Issue Date: August 29, 2026', 210, 150);

      // Billed To
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter';
      ctx.fillText('BILLED TO (CONFIDENTIAL):', 210, 210);
      ctx.fillStyle = '#d4d4d8';
      ctx.font = '500 15px Inter';
      ctx.fillText('Vanguard Alpha Partners LLC', 210, 235);
      ctx.fillText('Tax ID / SSN: 94-8291048', 210, 258);
      ctx.fillText('742 Evergreen Terrace, Suite 400', 210, 281);
      ctx.fillText('billing-direct@vanguardalpha.internal', 210, 304);

      // Bank Details
      ctx.fillStyle = '#101114';
      ctx.beginPath();
      ctx.roundRect(210, 520, 780, 180, 8);
      ctx.fill();
      ctx.strokeStyle = '#272933';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter';
      ctx.fillText('WIRE TRANSFER PAYMENT DETAILS (STRICTLY PRIVATE)', 230, 555);

      ctx.font = '500 14px JetBrains Mono';
      ctx.fillStyle = '#d4d4d8';
      ctx.fillText('Bank Name: Silicon Valley Trust & Custody', 230, 590);
      ctx.fillText('Account Holder: Antigravity Labs Inc.', 230, 615);
      ctx.fillText('Routing Number: 121000358', 230, 640);
      ctx.fillText('Account Number (IBAN): US89 SVTC 0001 2940 1829 4810', 230, 665);

      // Total
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter';
      ctx.fillText('TOTAL DUE: $64,500.00 USD', 680, 480);

    } else if (type === 'code') {
      // 3. API Key & Environment Config Screenshot
      ctx.fillStyle = '#0d0e11';
      ctx.fillRect(0, 0, width, height);

      // IDE Title bar
      ctx.fillStyle = '#15161b';
      ctx.fillRect(0, 0, width, 44);

      // Window dots
      ctx.fillStyle = '#52525b';
      ctx.beginPath(); ctx.arc(24, 22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(44, 22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(64, 22, 6, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = '#e4e4e7';
      ctx.font = '500 14px JetBrains Mono';
      ctx.fillText('.env.production — Confidential Production Secrets', 90, 27);

      const codeLines = [
        { line: '1', text: '# Production Environment Credentials — DO NOT COMMIT', color: '#71717a' },
        { line: '2', text: 'NODE_ENV="production"', color: '#10b981' },
        { line: '3', text: 'PORT=8080', color: '#f59e0b' },
        { line: '4', text: '', color: '#d4d4d8' },
        { line: '5', text: '# Payment Gateway Secret Token (Sample)', color: '#71717a' },
        { line: '6', text: 'PAYMENT_API_TOKEN="dummy_token_preview_sample_key_998877"', color: '#f43f5e' },
        { line: '7', text: 'WEBHOOK_SIGNING_KEY="dummy_webhook_secret_hash_value_12345"', color: '#f43f5e' },
        { line: '8', text: '', color: '#d4d4d8' },
        { line: '9', text: '# Database Connection String with Superuser Password', color: '#71717a' },
        { line: '10', text: 'DATABASE_URL="postgres://user:demo_password_123@db.internal.cloud:5432/main"', color: '#f59e0b' },
        { line: '11', text: '', color: '#d4d4d8' },
        { line: '12', text: '# Cloud Security Access Keys', color: '#71717a' },
        { line: '13', text: 'CLOUD_ACCESS_KEY="DEMO_KEY_ID_EXAMPLE"', color: '#e4e4e7' },
        { line: '14', text: 'CLOUD_SECRET_KEY="demo_secret_access_mock_key_example"', color: '#e4e4e7' },
        { line: '15', text: '', color: '#d4d4d8' },
        { line: '16', text: '# Admin Session Secret Key', color: '#71717a' },
        { line: '17', text: 'SESSION_SECRET="demo_session_hash_value_preview_only"', color: '#f43f5e' },
      ];

      codeLines.forEach((cl, idx) => {
        const ly = 90 + idx * 36;
        ctx.fillStyle = '#3f3f46';
        ctx.font = '500 15px JetBrains Mono';
        ctx.fillText(cl.line.padStart(2, ' '), 30, ly);

        ctx.fillStyle = cl.color;
        ctx.fillText(cl.text, 80, ly);
      });

    } else {
      // 4. Customer Support Chat
      ctx.fillStyle = '#0a0b0d';
      ctx.fillRect(0, 0, width, height);

      // Chat Container
      ctx.fillStyle = '#141519';
      ctx.beginPath();
      ctx.roundRect(200, 50, 800, 700, 16);
      ctx.fill();

      // Chat header
      ctx.fillStyle = '#1d1f26';
      ctx.beginPath();
      ctx.roundRect(200, 50, 800, 70, 16);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Inter';
      ctx.fillText('Support Ticket #8492 — Account Identity Verification', 240, 92);

      // Messages
      ctx.fillStyle = '#22242c';
      ctx.beginPath();
      ctx.roundRect(240, 160, 480, 100, 12);
      ctx.fill();
      ctx.fillStyle = '#f4f4f5';
      ctx.font = '400 15px Inter';
      ctx.fillText('Hello Emily, please confirm your registered phone number', 260, 195);
      ctx.fillText('and residential address to complete the security review.', 260, 225);

      // User sensitive reply
      ctx.fillStyle = '#2d303b';
      ctx.beginPath();
      ctx.roundRect(460, 290, 500, 150, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '400 15px Inter';
      ctx.fillText('Sure, my phone number is +1 (312) 555-8392.', 480, 325);
      ctx.fillText('My home address is 1042 W Madison St, Chicago, IL 60607.', 480, 355);
      ctx.fillText('My passport number on file is U89201948.', 480, 385);
      ctx.fillText('Thanks, Emily Vance (emily.vance@live.com)', 480, 415);
    }

    resolve(canvas.toDataURL('image/png'));
  });
}
