/**
 * JWT token payload structure containing user authentication information.
 *
 * @interface JwtPayload
 *
 * @example
 * ```typescript
 * import type { JwtPayload } from '../common/types';
 *
 * // Creating a JWT payload
 * const payload: JwtPayload = {
 *   sub: user.id,
 *   email: user.email
 * };
 *
 * // Signing the token
 * const token = await this.jwtService.signAsync(payload);
 * ```
 */
export interface JwtPayload {
  /** Subject (User ID) - standard JWT claim */
  sub: string;
  /** User email address */
  email: string;
}
