import { Injectable } from '@nestjs/common';

import { PrismaService } from '@libs/infrastructure';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}
}
