import { Injectable } from '@nestjs/common';

import { TrpcService } from '@libs/adapter';
import { AuthService, PostService, CommentService } from '@libs/business';

import {
  signUpSchema,
  signInSchema,
  SignUpInput,
  SignInInput,
} from './schemas/auth.schema';
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentsQuerySchema,
  getCommentSchema,
  CreateCommentInput,
  UpdateCommentInput,
  GetCommentsQueryInput,
  GetCommentInput,
} from './schemas/comment.schema';
import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
  getPostSchema,
  CreatePostInput,
  UpdatePostInput,
  GetPostsQueryInput,
  GetPostInput,
} from './schemas/post.schema';

/**
 * tRPC 라우터 - 모든 API 엔드포인트를 정의하는 메인 라우터
 */
@Injectable()
export class TrpcRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly authService: AuthService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  /**
   * 인증 관련 라우터
   */
  get authRouter() {
    return this.trpc.router({
      /**
       * 회원가입
       */
      signUp: this.trpc.publicProcedure
        .input(signUpSchema)
        .mutation(async ({ input }: { input: SignUpInput }) => {
          return this.authService.signUp(input);
        }),

      /**
       * 로그인
       */
      signIn: this.trpc.publicProcedure
        .input(signInSchema)
        .mutation(async ({ input }: { input: SignInInput }) => {
          return this.authService.signIn(input);
        }),
    });
  }

  /**
   * 게시글 관련 라우터
   */
  get postRouter() {
    return this.trpc.router({
      /**
       * 게시글 목록 조회
       */
      getPosts: this.trpc.publicProcedure
        .input(getPostsQuerySchema)
        .query(async ({ input }: { input: GetPostsQueryInput }) => {
          return this.postService.finds(input);
        }),

      /**
       * 게시글 상세 조회
       */
      getPost: this.trpc.publicProcedure
        .input(getPostSchema)
        .query(async ({ input }: { input: GetPostInput }) => {
          return this.postService.find(input.id);
        }),

      /**
       * 게시글 생성
       */
      createPost: this.trpc.protectedProcedure
        .input(createPostSchema)
        .mutation(async ({ input }: { input: CreatePostInput }) => {
          return this.postService.create(input);
        }),

      /**
       * 게시글 수정
       */
      updatePost: this.trpc.protectedProcedure
        .input(updatePostSchema)
        .mutation(async ({ input }: { input: UpdatePostInput }) => {
          return this.postService.update(input);
        }),

      /**
       * 게시글 삭제
       */
      deletePost: this.trpc.protectedProcedure
        .input(getPostSchema)
        .mutation(async ({ input }: { input: GetPostInput }) => {
          return this.postService.delete(input.id);
        }),
    });
  }

  /**
   * 댓글 관련 라우터
   */
  get commentRouter() {
    return this.trpc.router({
      /**
       * 특정 게시글의 댓글 목록 조회
       */
      getCommentsByPostId: this.trpc.publicProcedure
        .input(getCommentsQuerySchema)
        .query(async ({ input }: { input: GetCommentsQueryInput }) => {
          return this.commentService.findsByPostId(input);
        }),

      /**
       * 댓글 상세 조회
       */
      getComment: this.trpc.publicProcedure
        .input(getCommentSchema)
        .query(async ({ input }: { input: GetCommentInput }) => {
          return this.commentService.find(input.id);
        }),

      /**
       * 댓글 생성
       */
      createComment: this.trpc.protectedProcedure
        .input(createCommentSchema)
        .mutation(async ({ input }: { input: CreateCommentInput }) => {
          return this.commentService.create(input);
        }),

      /**
       * 댓글 수정
       */
      updateComment: this.trpc.protectedProcedure
        .input(updateCommentSchema)
        .mutation(async ({ input }: { input: UpdateCommentInput }) => {
          return this.commentService.update(input);
        }),

      /**
       * 댓글 삭제
       */
      deleteComment: this.trpc.protectedProcedure
        .input(getCommentSchema)
        .mutation(async ({ input }: { input: GetCommentInput }) => {
          return this.commentService.delete(input.id);
        }),
    });
  }

  /**
   * 메인 애플리케이션 라우터
   */
  get appRouter() {
    return this.trpc.router({
      auth: this.authRouter,
      post: this.postRouter,
      comment: this.commentRouter,
    });
  }
}

/**
 * tRPC 라우터 타입 추출 (클라이언트에서 사용)
 */
export type AppRouter = TrpcRouter['appRouter'];
