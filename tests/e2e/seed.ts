import * as argon2 from 'argon2';

import { PrismaClient } from '@prisma-client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://testuser:testpass@localhost:5433/testdb',
    },
  },
});

async function seed() {
  console.log('🌱 Seeding test data...');

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing test data...');
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing test data cleaned');

    // Create test users
    const hashedPassword = await argon2.hash('Password123!');

    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'john.doe@example.com',
          nickName: 'johndoe',
          password: hashedPassword,
          introduction: 'Test user for E2E testing',
        },
      }),
      prisma.user.create({
        data: {
          email: 'jane.smith@example.com',
          nickName: 'janesmith',
          password: hashedPassword,
          introduction: 'Another test user for E2E testing',
        },
      }),
      prisma.user.create({
        data: {
          email: 'bob.wilson@example.com',
          nickName: 'bobwilson',
          password: hashedPassword,
          introduction: 'Third test user for E2E testing',
        },
      }),
    ]);

    console.log('✅ Created test users:', users.length);

    // Create test posts
    const posts = await Promise.all([
      prisma.post.create({
        data: {
          title: 'First Test Post',
          content:
            'This is the content of the first test post for E2E testing.',
          slug: 'first-test-post',
          published: true,
          views: 10,
          authorId: users[0].id,
        },
      }),
      prisma.post.create({
        data: {
          title: 'Second Test Post',
          content:
            'This is the content of the second test post for E2E testing.',
          slug: 'second-test-post',
          published: true,
          views: 25,
          authorId: users[0].id,
        },
      }),
      prisma.post.create({
        data: {
          title: 'Draft Post',
          content: 'This is a draft post that is not published yet.',
          slug: 'draft-post',
          published: false,
          views: 0,
          authorId: users[1].id,
        },
      }),
      prisma.post.create({
        data: {
          title: 'Popular Post',
          content: 'This is a very popular post with many views.',
          slug: 'popular-post',
          published: true,
          views: 100,
          authorId: users[1].id,
        },
      }),
      prisma.post.create({
        data: {
          title: 'Recent Post',
          content: 'This is the most recent post for testing.',
          slug: 'recent-post',
          published: true,
          views: 5,
          authorId: users[2].id,
        },
      }),
    ]);

    console.log('✅ Created test posts:', posts.length);

    // Create test comments
    const comments = await Promise.all([
      prisma.comment.create({
        data: {
          content: 'Great post! Thanks for sharing.',
          postId: posts[0].id,
          authorId: users[1].id,
        },
      }),
      prisma.comment.create({
        data: {
          content: 'I really enjoyed reading this.',
          postId: posts[0].id,
          authorId: users[2].id,
        },
      }),
      prisma.comment.create({
        data: {
          content: 'Very informative content.',
          postId: posts[1].id,
          authorId: users[2].id,
        },
      }),
      prisma.comment.create({
        data: {
          content: 'Looking forward to more posts like this.',
          postId: posts[3].id,
          authorId: users[0].id,
        },
      }),
      prisma.comment.create({
        data: {
          content: 'Excellent work!',
          postId: posts[3].id,
          authorId: users[2].id,
        },
      }),
    ]);

    console.log('✅ Created test comments:', comments.length);
    console.log('🎉 Test data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default seed;
