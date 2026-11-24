import crypto from 'crypto';

/**
 * DirectPay IPG helpers (server only).
 * Same signing scheme as the working Green Code Solution integration:
 *   dataString = base64(JSON payload), signature = HMAC-SHA256(dataString, secret) as hex.
 * DirectPay's server-to-server notification sends a base64 body with header `Authorization: HMAC <hex>`.
 */

export type DirectPayStage = 'DEV' | 'PROD';

function config() {
  const merchantId = process.env.DIRECTPAY_MERCHANT_ID;
  const secret = process.env.DIRECTPAY_SECRET_KEY;
  const stage: DirectPayStage = process.env.DIRECTPAY_STAGE === 'PROD' ? 'PROD' : 'DEV';
  const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  if (!merchantId || !secret || !siteUrl) {
    throw new Error('DirectPay is not configured (DIRECTPAY_MERCHANT_ID, DIRECTPAY_SECRET_KEY, NEXT_PUBLIC_APP_URL)');
  }
  return { merchantId, secret, stage, siteUrl };
}

export function isDirectPayConfigured(): boolean {
  return Boolean(process.env.DIRECTPAY_MERCHANT_ID && process.env.DIRECTPAY_SECRET_KEY && process.env.NEXT_PUBLIC_APP_URL);
}

function sign(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/** Builds the signed checkout session. Amount always comes from the saved order, never from the browser. */
export function createDirectPaySession(order: {
  orderNumber: string;
  total: number;
  statusToken: string;
  fullName: string;
  email?: string;
  phone: string;
}) {
  const { merchantId, secret, stage, siteUrl } = config();
  const [firstName, ...rest] = order.fullName.trim().split(/\s+/);

  const payload = {
    merchant_id: merchantId,
    amount: order.total.toFixed(2),
    type: 'ONE_TIME',
    order_id: order.orderNumber,
    currency: 'LKR',
    response_url: `${siteUrl}/api/directpay/notify`,
    return_url: `${siteUrl}/checkout/status?order=${encodeURIComponent(order.orderNumber)}&token=${order.statusToken}`,
    first_name: firstName || 'Customer',
    last_name: rest.join(' '),
    email: order.email || '',
    phone: order.phone,
    logo: '',
  };

  const dataString = Buffer.from(JSON.stringify(payload)).toString('base64');
  return { dataString, signature: sign(dataString, secret), stage };
}

/** Verifies a DirectPay notification. Returns the decoded payload, or null if the signature is wrong. */
export function verifyDirectPayNotification(rawBody: string, authHeader: string | null): Record<string, any> | null {
  const { secret } = config();
  if (!authHeader || !authHeader.startsWith('HMAC ')) return null;

  const received = Buffer.from(authHeader.slice(5).trim(), 'utf8');
  const expected = Buffer.from(sign(rawBody, secret), 'utf8');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;

  try {
    return JSON.parse(Buffer.from(rawBody, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export function mapDirectPayStatus(raw: string | undefined): 'paid' | 'failed' | 'cancelled' | 'pending' {
  const s = (raw || '').toLowerCase();
  if (s === 'success' || s === 'successful') return 'paid';
  if (s === 'failed' || s === 'fail') return 'failed';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  return 'pending';
}
