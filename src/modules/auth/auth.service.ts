import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto';
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

  async register(registerDto: CreateUserDto) {
    // 1. Check if user existed
    const isUsernameExisted = await this.userService.isUsernameExisted(registerDto.username);
    if (isUsernameExisted) throw new BadRequestException(ErrorMessages.USER.EXIST);

    // 2. Hash password
    const { password } = registerDto;
    const passwordHash = password ? await hashPassword(password) : "";

    // 3. Create new user
    const newUser = await this.userService.create({
      ...registerDto,
      password: passwordHash,
    });
    if (!newUser) throw new BadRequestException(ErrorMessages.AUTH.REGISTER_FAIL);

    return newUser;
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
