import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({ username: createUserDto.username });
    if (existingUser) {
        throw new ConflictException(ErrorMessages.USER.EXIST);
    }

    const role = await this.rolesRepository.findOneBy({ id: createUserDto.roleId });
    if (!role) {
        throw new NotFoundException('Role not found');
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

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async isUsernameExisted(username: string): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ username });
    return !!user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  } 

  async findOneWithRolePermissions(userId: number) {
    return this.usersRepository.findOne({
        where: { id: userId },
        relations: ['role', 'role.permissions'],
    });
  }

  async findOneWithRole(userId: number) {
    return this.usersRepository.findOne({
        where: { id: userId },
        relations: ['role'],
    });
}
}
