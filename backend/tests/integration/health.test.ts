import request from 'supertest';
import { Application } from 'express';
import { createTestApp } from '../helpers/appFactory';

describe('Health Check', () => {
  let app: Application;

  beforeAll(() => {
    app = createTestApp();
  });

  it('should return 200 on health endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('environment');
  });

  it('should return welcome message on root', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('VagaLume');
  });
});
