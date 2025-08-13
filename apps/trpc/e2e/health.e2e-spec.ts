import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { describe, it, expect, beforeEach } from 'vitest';

import type { AppRouter } from '../src/trpc.router';

const TRPC_BASE_URL = 'http://localhost:3001/trpc';

describe('tRPC Health Check E2E Tests', () => {
  let trpc: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeEach(() => {
    trpc = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: TRPC_BASE_URL,
        }),
      ],
    });
  });

  it('should connect to tRPC server successfully', async () => {
    // Test that we can connect to the tRPC server
    // by attempting to make a simple query
    try {
      // This should not throw a network error if the server is running
      await trpc.post.getPosts.query({
        take: 1,
        onlyPublished: true,
      });

      // If we get here, the server is responding
      expect(true).toBe(true);
    } catch (error: any) {
      // If it's a network error, the server is not running
      if (
        error.message?.includes('fetch') ||
        error.message?.includes('ECONNREFUSED')
      ) {
        throw new Error('tRPC server is not running or not accessible');
      }

      // Other errors are acceptable (e.g., validation errors, business logic errors)
      // as they indicate the server is running and responding
      expect(true).toBe(true);
    }
  });
});
