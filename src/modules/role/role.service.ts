import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permission.entity';
import { Role } from 'src/entities/role.entity';
import { In, Repository } from 'typeorm';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) {}

    async create(createRoleDto: CreateRoleDto) {
        const { name, permissionIds } = createRoleDto;

        // check name exists
        await this.isNameExist(name);
        
        // create role
        const role = new Role();
        role.name = name;
    
        if (permissionIds && permissionIds.length > 0) {
            role.permissions = await this.permissionRepository.find({
                where: { id: In(permissionIds) }
            });
        }
    
        return await this.roleRepository.save(role);
    }

    async findAll(): Promise<Role[]> {
        return await this.roleRepository.find();
    }

    async findOne(id: number): Promise<Role> {
        const role = await this.roleRepository.findOneBy({ id });
        if (!role) {
            throw new NotFoundException('Role not found');
        }
        return role;
    }

    async update(id: number, updateRoleDto: UpdateRoleDto) {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
        if (!role) {
            throw new NotFoundException('Role not found');
        }
    
        // check name exists
        await this.isNameExist(updateRoleDto.name);

        // update role
        if (updateRoleDto.name) {
            role.name = updateRoleDto.name;
        }

        if (updateRoleDto.permissionIds) {
            role.permissions = await this.permissionRepository.findByIds(updateRoleDto.permissionIds);
        }
    
        return await this.roleRepository.save(role);
    }

    async remove(id: number): Promise<void> {
        await this.roleRepository.delete(id);
    }

    private async isNameExist(name: string) {
        const role = await this.roleRepository.findOneBy({ name });
        if (role) {
            throw new ConflictException('Role already exists');
        }
    }

    // async assignPermission(roleId: number, permissionId: number): Promise<Role> {
    //     const role = await this.findOne(roleId);
    //     const permission = await this.permissionsRepository.findOneBy({ id: permissionId });
    //     if (!permission) {
    //         throw new NotFoundException('Permission not found');
    //     }
    //     role.permissions = [...(role.permissions || []), permission];
    //     return this.rolesRepository.save(role);
    // }

    // async removePermission(roleId: number, permissionId: number): Promise<Role> {
    //     const role = await this.findOne(roleId);
    //     role.permissions = role.permissions.filter(p => p.id !== permissionId);
    //     return this.rolesRepository.save(role);
    // }
}
