import supertest from 'supertest';
import app from '../server';

const request = supertest(app);

describe('User API', () => {
  const testUser = {
    fullName: 'Profile Test User',
    email: `profile-test-${Date.now()}@example.com`,
    password: 'TestPassword@123',
    confirmPassword: 'TestPassword@123',
  };
  let accessToken: string;

  beforeAll(async () => {
    await request.post('/api/v1/auth/register').send(testUser);
    const loginRes = await request.post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    accessToken = loginRes.body.data.accessToken as string;
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        college: 'IIT Delhi',
        branch: 'Computer Science',
        degree: 'B.Tech',
        currentYear: 3,
        graduationYear: 2026,
        cgpa: 9.2,
        bio: 'Software development & AI enthusiast.',
      };

      const res = await request
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.college).toBe('IIT Delhi');
      expect(res.body.data.profile.cgpa).toBe(9.2);
    });

    it('should return 422 for invalid CGPA', async () => {
      const res = await request
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ cgpa: 15 });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/users/preferences', () => {
    it('should update user preferences', async () => {
      const res = await request
        .put('/api/v1/users/preferences')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ theme: 'dark', notifications: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.preferences.theme).toBe('dark');
    });
  });

  describe('DELETE /api/v1/users/delete', () => {
    it('should delete user account', async () => {
      const res = await request
        .delete('/api/v1/users/delete')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify user can no longer log in
      const loginRes = await request.post('/api/v1/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(loginRes.status).toBe(401);
    });
  });
});
