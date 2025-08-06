-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."posts" DROP CONSTRAINT "posts_authorId_fkey";

-- CreateIndex
CREATE INDEX "comments_postId_idx" ON "public"."comments"("postId");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "public"."comments"("authorId");

-- CreateIndex
CREATE INDEX "posts_authorId_idx" ON "public"."posts"("authorId");
