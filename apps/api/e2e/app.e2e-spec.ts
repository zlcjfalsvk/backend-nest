import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { describe, it, expect, beforeEach } from 'vitest';

const API_BASE_URL = 'http://localhost:3000';

describe('API Application E2E Tests', () => {
  let request: TestAgent<supertest.Test>;

  beforeEach(() => {
    request = supertest(API_BASE_URL);
  });

  it('should respond to health check on /posts endpoint', async () => {
    // Since there's no root controller, test an existing endpoint
    const response = await request.get('/posts');

    // Should return 200 (success) rather than 404
    expect([200].includes(response.status)).toBe(true);
    expect(response.body).toBeDefined();
  });
});
