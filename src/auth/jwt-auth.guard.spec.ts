import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtPayload } from '../common/types';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const createMockContext = (
    headers: Record<string, string> = {},
  ): ExecutionContext => {
    const mockRequest = {
      headers,
      user: undefined,
    } as Record<string, object | undefined>;

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for valid JWT token', async () => {
      const userId = crypto.randomUUID();
      const payload: JwtPayload = {
        sub: userId,
        email: 'test@example.com',
      };
      const context = createMockContext({
        authorization: 'Bearer valid.jwt.token',
      });

      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid.jwt.token',
        {
          secret: process.env.JWT_SECRET || 'default_jwt_secret',
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const request = context.switchToHttp().getRequest();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(request.user).toEqual(payload);
    });

    it('should use environment JWT_SECRET when available', async () => {
      const originalEnv = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'custom_secret';

      const userId = crypto.randomUUID();
      const payload: JwtPayload = {
        sub: userId,
        email: 'test@example.com',
      };
      const context = createMockContext({
        authorization: 'Bearer valid.jwt.token',
      });

      mockJwtService.verifyAsync.mockResolvedValue(payload);

      await guard.canActivate(context);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid.jwt.token',
        {
          secret: 'custom_secret',
        },
      );

      process.env.JWT_SECRET = originalEnv;
    });

    it('should throw UnauthorizedException when no authorization header', async () => {
      const context = createMockContext({});

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is malformed', async () => {
      const context = createMockContext({
        authorization: 'InvalidFormat token',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no Bearer prefix', async () => {
      const context = createMockContext({
        authorization: 'token.without.bearer',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when JWT verification fails', async () => {
      const context = createMockContext({
        authorization: 'Bearer invalid.jwt.token',
      });

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'invalid.jwt.token',
        {
          secret: process.env.JWT_SECRET || 'default_jwt_secret',
        },
      );
    });

    it('should handle empty Bearer token', async () => {
      const context = createMockContext({
        authorization: 'Bearer ',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('should handle authorization header with only Bearer', async () => {
      const context = createMockContext({
        authorization: 'Bearer',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer authorization header', () => {
      const request = {
        headers: {
          authorization: 'Bearer valid.jwt.token',
        },
      };

      const token = guard['extractTokenFromHeader'](request);
      expect(token).toBe('valid.jwt.token');
    });

    it('should return undefined for missing authorization header', () => {
      const request = {
        headers: {},
      };

      const token = guard['extractTokenFromHeader'](request);
      expect(token).toBeUndefined();
    });

    it('should return undefined for invalid authorization format', () => {
      const request = {
        headers: {
          authorization: 'Basic username:password',
        },
      };

      const token = guard['extractTokenFromHeader'](request);
      expect(token).toBeUndefined();
    });
  });
});
