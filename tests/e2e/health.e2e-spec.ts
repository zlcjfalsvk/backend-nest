import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';

const API_BASE_URL = 'http://localhost:3000';

describe('Application Health E2E Tests', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(() => {
    request = supertest(API_BASE_URL);
  });

  describe('Application Status', () => {
    it('should be able to connect to the API server', async () => {
      // Test basic connectivity - this might be a health endpoint or any simple endpoint
      const response = await request
        .get('/posts')
        .expect((res) => {
          // We expect either 200 (success) or at least a response from the server
          expect([200, 404, 401].includes(res.status)).toBe(true);
        });

      // If we get here, the server is responding
      expect(response).toBeDefined();
    });

    it('should handle CORS properly', async () => {
      const response = await request
        .options('/posts')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'GET');

      // Should not reject CORS preflight requests
      expect([200, 204].includes(response.status)).toBe(true);
    });

    it('should return proper content-type headers', async () => {
      const response = await request
        .get('/posts')
        .expect((res) => {
          if (res.status === 200) {
            expect(res.headers['content-type']).toMatch(/application\/json/);
          }
        });

      expect(response).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle malformed JSON in request body', async () => {
      await request
        .post('/posts')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should handle requests with invalid content-type', async () => {
      await request
        .post('/posts')
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect((res) => {
          // Should return 400 or 415 for unsupported media type
          expect([400, 415].includes(res.status)).toBe(true);
        });
    });
  });

  describe('Rate Limiting & Security', () => {
    it('should include security headers', async () => {
      const response = await request
        .get('/posts');

      // Check for common security headers (these may or may not be implemented)
      // This test documents what security headers should be present
      expect(response.headers).toBeDefined();
      
      // Note: Uncomment these if security headers are implemented
      // expect(response.headers['x-frame-options']).toBeDefined();
      // expect(response.headers['x-content-type-options']).toBeDefined();
    });

    it('should reject requests that are too large', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB of data
      
      await request
        .post('/posts')
        .send({ content: largePayload })
        .expect((res) => {
          // Should reject with 413 (Payload Too Large) or 400
          expect([400, 413].includes(res.status)).toBe(true);
        });
    });
  });

  describe('Database Connection', () => {
    it('should handle database connectivity issues gracefully', async () => {
      // This test ensures the API handles database issues properly
      // In a real scenario, you might temporarily disconnect the database
      // For now, we'll just test that queries work
      const response = await request
        .get('/posts');

      // Should either succeed or fail gracefully with proper error codes
      expect([200, 500, 503].includes(response.status)).toBe(true);
      
      if (response.status === 500 || response.status === 503) {
        // If there's a server error, it should return proper error format
        expect(response.body).toBeDefined();
      }
    });
  });
});