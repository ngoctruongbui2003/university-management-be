import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Repository } from 'typeorm';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
    ) {}

    async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        const existingPermission = await this.permissionsRepository.findOneBy({ name: createPermissionDto.name });
        if (existingPermission) {
            throw new ConflictException('Permission already exists');
        }
        const permission = this.permissionsRepository.create(createPermissionDto);
        return await this.permissionsRepository.save(permission);
    }

    findAll(): Promise<Permission[]> {
        return this.permissionsRepository.find();
    }

    async findOne(id: number): Promise<Permission> {
        const permission = await this.permissionsRepository.findOneBy({ id });
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        return permission;
    }

    async update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
        await this.permissionsRepository.update(id, updatePermissionDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.permissionsRepository.delete(id);
    }
}
