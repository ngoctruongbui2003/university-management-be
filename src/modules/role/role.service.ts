import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private rolesRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionsRepository: Repository<Permission>,
    ) {}

    async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const existingRole = await this.rolesRepository.findOneBy({ name: createRoleDto.name });
        if (existingRole) {
            throw new ConflictException('Role already exists');
        }
        const role = this.rolesRepository.create(createRoleDto);
        return await this.rolesRepository.save(role);
    }

    findAll(): Promise<Role[]> {
        return this.rolesRepository.find();
    }

    async findOne(id: number): Promise<Role> {
        const role = await this.rolesRepository.findOneBy({ id });
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return role;
    }

    async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
        await this.rolesRepository.update(id, updateRoleDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.rolesRepository.delete(id);
    }

    async assignPermission(roleId: number, permissionId: number): Promise<Role> {
        const role = await this.findOne(roleId);
        const permission = await this.permissionsRepository.findOneBy({ id: permissionId });
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        role.permissions = [...(role.permissions || []), permission];
        return this.rolesRepository.save(role);
    }

    async removePermission(roleId: number, permissionId: number): Promise<Role> {
        const role = await this.findOne(roleId);
        role.permissions = role.permissions.filter(p => p.id !== permissionId);
        return this.rolesRepository.save(role);
    }
}
