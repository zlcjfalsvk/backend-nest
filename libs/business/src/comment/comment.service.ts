import { Injectable } from '@nestjs/common';

import { PrismaService } from '@libs/infrastructure';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}
}
