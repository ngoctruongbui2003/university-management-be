import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';
import { hashPassword } from 'src/shared/utils';
import { Role } from 'src/entities/role.entity';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async register(registerDto: CreateUserDto) {
    // 1. Check if username and email existed
    const isUsernameExisted = await this.isUsernameExisted(registerDto.username);
    if (isUsernameExisted) throw new BadRequestException(ErrorMessages.USER.EXIST);

    const isEmailExisted = await this.isEmailExisted(registerDto.email);
    if (isEmailExisted) throw new BadRequestException(ErrorMessages.USER.EXIST);

    // 2. Hash password
    const { password } = registerDto;
    const passwordHash = password ? await hashPassword(password) : "";

    // 3. Create new user
    const newUser = await this.create({
      ...registerDto,
      password: passwordHash,
    });
    if (!newUser) throw new BadRequestException(ErrorMessages.AUTH.REGISTER_FAIL);

    return newUser;
  }
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({ username: createUserDto.username });
    if (existingUser) {
        throw new ConflictException(ErrorMessages.USER.EXIST);
    }

    const role = await this.rolesRepository.findOneBy({ id: createUserDto.roleId });
    if (!role) {
        throw new NotFoundException(ErrorMessages.ROLE.NOT_FOUND);
    }

    const user = this.usersRepository.create({
        username: createUserDto.username,
        password: createUserDto.password,
        full_name: createUserDto.full_name,
        email: createUserDto.email,
        role,
    });

    return this.usersRepository.save(user);
}

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER.NOT_FOUND);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException(ErrorMessages.USER.NOT_FOUND);
    }
    return user;
  }

  async isUsernameExisted(username: string): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ username });
    return !!user;
  }

  async isEmailExisted(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ email });
    return !!user;
  }


  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // 1. Check if username and email existed
    const isUsernameExisted = await this.isUsernameExisted(updateUserDto.username);
    if (isUsernameExisted) throw new BadRequestException(ErrorMessages.USER.EXIST);

    const isEmailExisted = await this.isEmailExisted(updateUserDto.email);
    if (isEmailExisted) throw new BadRequestException(ErrorMessages.USER.EXIST);

    // 2. Hash password
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }

    // 3. Update user
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  } 

  async hasPermissions(userId: number, requiredPermissions: string[]): Promise<boolean> {
    const user = await this.findOneWithRolePermissions(userId);
    if (!user || !user.role || !user.role.permissions) return false;
    const rolePermissions = user.role.permissions.map(p => p.name);
    return requiredPermissions.every(p => rolePermissions.includes(p));
  }

  private async findOneWithRolePermissions(userId: number) {
    return await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['role', 'role.permissions'],
    });
  }

  async findOneWithRole(userId: number) {
    return await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['role'],
    });
}
}
