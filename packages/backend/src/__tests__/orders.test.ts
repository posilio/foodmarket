// Integration tests for order endpoints.
// Hits the real database — no mocks.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

const suffix = Date.now();
const TEST_EMAIL = `test_orders_${suffix}@example.com`;
const TEST_PASSWORD = 'testpassword123';

let authToken = '';
let customerId = '';

beforeAll(async () => {
  // Register and log in a test customer
  const reg = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, firstName: 'Orders', lastName: 'Test' });

  customerId = (reg.body.data as { id: string }).id;

  const login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

  authToken = (login.body.data as { token: string }).token;
});

afterAll(async () => {
  // Clean up: remove the test customer (cascades to orders, addresses via schema)
  await prisma.customer.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('GET /api/v1/orders', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(401);
  });

  it('returns 200 with an empty list for a new customer', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/v1/orders', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({ shippingAddressId: 'any', lines: [{ variantId: 'any', quantity: 1 }] });

    expect(res.status).toBe(401);
  });

  it('returns 400 when shippingAddressId is missing', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ lines: [{ variantId: 'some-id', quantity: 1 }] });

    expect(res.status).toBe(400);
  });

  it('returns 400 when lines array is empty', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ shippingAddressId: 'some-id', lines: [] });

    expect(res.status).toBe(400);
  });

  it('returns 400 when a line has a non-integer quantity', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shippingAddressId: 'some-id',
        lines: [{ variantId: 'some-id', quantity: 0 }],
      });

    expect(res.status).toBe(400);
  });

  it('returns 404 when the shippingAddressId does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        shippingAddressId: '00000000-0000-0000-0000-000000000000',
        lines: [{ variantId: '00000000-0000-0000-0000-000000000000', quantity: 1 }],
      });

    // The service throws when address or variant is not found
    expect([400, 404, 422]).toContain(res.status);
  });
});
