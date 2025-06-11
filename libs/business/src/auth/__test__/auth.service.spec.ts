import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { AuthService } from '@libs/business';
import { PrismaService } from '@libs/infrastructure';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockDeep<PrismaService>() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });
});
