import supertest from 'supertest';
import app from '../server';

const request = supertest(app);

describe('Auth API', () => {
  const testUser = {
    fullName: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'Test@1234',
    confirmPassword: 'Test@1234',
  };
  let accessToken: string;

  // ─── Register ─────────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request.post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        ...testUser,
        email: 'not-an-email',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for weak password', async () => {
      const res = await request.post('/api/v1/auth/register').send({
        ...testUser,
        password: '123',
        confirmPassword: '123',
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      const res = await request.post('/api/v1/auth/register').send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── Login ────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      accessToken = res.body.data.accessToken as string;
    });

    it('should return 401 for wrong password', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword@1',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request.post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'Test@1234',
      });

      expect(res.status).toBe(401);
    });
  });

  // ─── Protected Routes ─────────────────────────────────────────

  describe('GET /api/v1/users/me', () => {
    it('should return current user when authenticated', async () => {
      const res = await request
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('should return 401 without token', async () => {
      const res = await request.get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });
  });

  // ─── Health Check ─────────────────────────────────────────────

  describe('GET /api/v1/health', () => {
    it('should return 200 health check', async () => {
      const res = await request.get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
