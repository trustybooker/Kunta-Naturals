import crypto from 'node:crypto';

function getSecret() {
  const configuredSecret = process.env.DELIVERY_TOKEN_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (configuredSecret) return configuredSecret;

  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-delivery-secret-change-me';
  }

  throw new Error('DELIVERY_TOKEN_SECRET is required in production.');
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
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length) return null;
  const valid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!valid) return null;
  return { sessionId, productId };
}

export function hashDeliveryToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
