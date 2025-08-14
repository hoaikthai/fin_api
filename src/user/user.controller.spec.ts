import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/types';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRequest: AuthenticatedRequest = {
    user: {
      sub: 1,
      email: 'test@example.com',
    },
  } as AuthenticatedRequest;

  const mockUserProfile = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUserService.getProfile.mockResolvedValue(mockUserProfile);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUserProfile);
      expect(mockUserService.getProfile).toHaveBeenCalledWith(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('User not found');
      mockUserService.getProfile.mockRejectedValue(error);

      await expect(
        controller.getProfile(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          mockRequest as any,
        ),
      ).rejects.toThrow(error);
      expect(mockUserService.getProfile).toHaveBeenCalledWith(1);
    });
  });

  describe('updateProfile', () => {
    const updateProfileDto: UpdateProfileDto = {
      firstName: 'UpdatedJohn',
      lastName: 'UpdatedDoe',
    };

    const updatedUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'UpdatedJohn',
      lastName: 'UpdatedDoe',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update user profile and return profile without password', async () => {
      mockUserService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(
        mockRequest,
        updateProfileDto,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...expectedProfile } = updatedUser;
      expect(result).toEqual(expectedProfile);
      expect(result).not.toHaveProperty('password');
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        1,
        updateProfileDto,
      );
    });

    it('should handle service errors during update', async () => {
      const error = new Error('Update failed');
      mockUserService.updateProfile.mockRejectedValue(error);

      await expect(
        controller.updateProfile(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          mockRequest as any,
          updateProfileDto,
        ),
      ).rejects.toThrow(error);
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        1,
        updateProfileDto,
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto: UpdateProfileDto = {
        firstName: 'OnlyFirstName',
      };

      const partiallyUpdatedUser = {
        ...updatedUser,
        firstName: 'OnlyFirstName',
        lastName: 'Doe',
      };

      mockUserService.updateProfile.mockResolvedValue(partiallyUpdatedUser);

      const result = await controller.updateProfile(
        mockRequest,
        partialUpdateDto,
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...expectedProfile } = partiallyUpdatedUser;
      expect(result).toEqual(expectedProfile);
      expect(mockUserService.updateProfile).toHaveBeenCalledWith(
        1,
        partialUpdateDto,
      );
    });
  });
});
