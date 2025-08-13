import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

import { Token } from '@libs/business';
import { PrismaService } from '@libs/infrastructure';

import { CustomError, ERROR_CODES } from '../custom-error';

@Injectable()
export class AuthorOwnershipGuard implements CanActivate {
  constructor(private readonly prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'] as Token;
    const resourceId = parseInt(request.params['id']);

    if (!user || !user.sub) {
      throw new ForbiddenException('User information is required');
    }

    if (isNaN(resourceId)) {
      throw new ForbiddenException('Valid resource ID is required');
    }

    const controllerClass = context.getClass();
    const resourceType = this.getResourceTypeFromController(
      controllerClass.name,
    );

    await this.validateOwnership(user.sub, resourceId, resourceType);

    return true;
  }

  private getResourceTypeFromController(
    controllerName: string,
  ): 'post' | 'comment' {
    if (controllerName.toLowerCase().includes('post')) {
      return 'post';
    } else if (controllerName.toLowerCase().includes('comment')) {
      return 'comment';
    }
    throw new ForbiddenException('Unsupported resource type');
  }

  private async validateOwnership(
    userId: string,
    resourceId: number,
    resourceType: 'post' | 'comment',
  ): Promise<void> {
    if (resourceType === 'post') {
      const post = await this.prismaService.post.findUnique({
        where: { id: resourceId },
        select: { authorId: true, deletedAt: true },
      });

      if (!post) {
        throw new CustomError(
          ERROR_CODES.POST_NOT_FOUND,
          `Post with ID ${resourceId} not found`,
        );
      }

      if (post.deletedAt) {
        throw new CustomError(
          ERROR_CODES.POST_DELETED,
          'Post has been deleted',
        );
      }

      if (post.authorId !== userId) {
        throw new ForbiddenException('You can only access your own posts');
      }
    } else if (resourceType === 'comment') {
      const comment = await this.prismaService.comment.findUnique({
        where: { id: resourceId },
        select: { authorId: true, deletedAt: true },
      });

      if (!comment) {
        throw new CustomError(
          ERROR_CODES.COMMENT_NOT_FOUND,
          `Comment with ID ${resourceId} not found`,
        );
      }

      if (comment.deletedAt) {
        throw new CustomError(
          ERROR_CODES.COMMENT_DELETED,
          'Comment has been deleted',
        );
      }

      if (comment.authorId !== userId) {
        throw new ForbiddenException('You can only access your own comments');
      }
    }
  }
}
