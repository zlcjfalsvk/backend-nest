import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { describe, it, expect, beforeEach } from 'vitest';

import type { AppRouter } from '../src/trpc.router';

const TRPC_BASE_URL = 'http://localhost:3001/trpc';

describe('tRPC Application E2E Tests', () => {
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

  it('should connect to tRPC server and handle basic requests', async () => {
    // Test that we can make a basic query to the server
    try {
      // Attempt to get posts - this should work even if no posts exist
      const posts = await trpc.post.getPosts.query({
        take: 10,
        onlyPublished: true,
      });

      // Should return a result structure based on the actual schema
      expect(posts).toBeDefined();
    } catch (error) {
      // If there's a network error, the server might not be running
      console.error('tRPC server connection failed:', error);
      throw error;
    }
  });
});