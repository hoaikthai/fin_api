import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserProfileDto> {
    return this.userService.getProfile(req.user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    const updatedUser = await this.userService.updateProfile(
      req.user.sub,
      updateProfileDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...profile } = updatedUser;
    return profile;
  }
}
