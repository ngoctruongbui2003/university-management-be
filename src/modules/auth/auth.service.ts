import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';
import { JwtSharedService } from 'src/shared/components/jwt/jwt.service';
import { CreateUserDto } from '../user/dto';
import { comparePassword, hashPassword } from 'src/shared/utils';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtSharedService: JwtSharedService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    
    if (user && await comparePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // 1. Generate token and refresh token
    const payload = {
      sub: user.id,
      username: user.username,
    };
    const token = await this.jwtSharedService.generateTokens(payload);

    return token;
  }
}
