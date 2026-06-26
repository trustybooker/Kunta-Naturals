import crypto from 'node:crypto';

function getSecret() {
  return process.env.DELIVERY_TOKEN_SECRET || process.env.STRIPE_WEBHOOK_SECRET || 'dev-only-delivery-secret-change-me';
}

export function createDeliveryToken(sessionId: string, productId: string) {
  const payload = `${sessionId}:${productId}`;
  const signature = crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

export function parseDeliveryToken(token: string) {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;

  let payload: string;

  try {
    payload = Buffer.from(encoded, 'base64url').toString('utf8');
  } catch {
    return null;
  }

  const [sessionId, productId] = payload.split(':');
  if (!sessionId || !productId) return null;

  const expected = crypto.createHmac('sha256', getSecret()).update(`${sessionId}:${productId}`).digest('base64url');
  const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!valid) return null;
  return { sessionId, productId };
}

export function hashDeliveryToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
