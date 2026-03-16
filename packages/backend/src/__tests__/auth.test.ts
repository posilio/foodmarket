// Integration tests for auth endpoints.
// Hits the real database — no mocks.
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

// Unique suffix so parallel runs / reruns don't collide
const suffix = Date.now();
const TEST_EMAIL = `test_auth_${suffix}@example.com`;
const TEST_PASSWORD = 'testpassword123';

afterAll(async () => {
  // Clean up the test customer created during the suite
  const customer = await prisma.customer.findUnique({ where: { email: TEST_EMAIL } });
  if (customer) {
    await prisma.refreshToken.deleteMany({ where: { customerId: customer.id } });
  }
  await prisma.customer.deleteMany({ where: { email: TEST_EMAIL } });
  await prisma.$disconnect();
});

describe('POST /api/v1/auth/register', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL });

    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL, password: 'short', firstName: 'Test', lastName: 'User' });

    expect(res.status).toBe(400);
  });

  it('registers a new customer and returns 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD, firstName: 'Test', lastName: 'User' });

    expect(res.status).toBe(201);
    expect(res.body.data.customer).toMatchObject({
      email: TEST_EMAIL,
      firstName: 'Test',
      lastName: 'User',
    });
    expect(res.body.data.customer).not.toHaveProperty('passwordHash');
  });

  it('returns 409 when email is already registered', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD, firstName: 'Test', lastName: 'User' });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL });

    expect(res.status).toBe(400);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 200 with token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.split('.').length).toBe(3); // JWT format
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });

  it('returns 200 with customer data for a valid token', async () => {
    // Log in to get a real token
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    const token: string = login.body.data.token;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_EMAIL);
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });
});
