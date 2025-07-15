import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MajorService } from './major.service';
import { CreateMajorDto, UpdateMajorDto } from './dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('majors')
@ApiBearerAuth('access-token')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class MajorController {
    constructor(private readonly majorService: MajorService) {}

    @Post()
    // @RequirePermissions('create:major')
    create(@Body() createMajorDto: CreateMajorDto) {
        return this.majorService.create(createMajorDto);
    }

    @Get()
    // @RequirePermissions('view:major')
    findAll() {
        return this.majorService.findAll();
    }

    @Get(':id')
    // @RequirePermissions('view:major')
    findOne(@Param('id') id: string) {
        return this.majorService.findOne(+id);
    }

    @Patch(':id')
    // @RequirePermissions('update:major')
    update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
        return this.majorService.update(+id, updateMajorDto);
    }

    @Delete(':id')
    // @RequirePermissions('delete:major')
    remove(@Param('id') id: string) {
        return this.majorService.remove(+id);
    }
} 