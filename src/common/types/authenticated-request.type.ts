import { Request } from 'express';

/**
 * Request object with authenticated user information from JWT token.
 * 
 * @interface AuthenticatedRequest
 * @extends {Request}
 * 
 * @example
 * ```typescript
 * import type { AuthenticatedRequest } from '../common/types';
 * 
 * @Controller('example')
 * @UseGuards(JwtAuthGuard)
 * export class ExampleController {
 *   @Get('profile')
 *   async getProfile(@Request() req: AuthenticatedRequest) {
 *     const userId = req.user.sub; // User ID from JWT
 *     const email = req.user.email; // User email from JWT
 *     // ... controller logic
 *   }
 * }
 * ```
 */
export interface AuthenticatedRequest extends Request {
  user: {
    /** User ID from JWT token (sub claim) */
    sub: number;
    /** User email from JWT token */
    email: string;
  };
}
