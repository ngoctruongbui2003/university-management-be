import { Controller, Get } from '@nestjs/common';
import { CurriculumSessionsService } from './curriculum-sessions.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('curriculum-sessions')
@ApiBearerAuth('access-token')
export class CurriculumSessionsController {
    constructor(private readonly curriculumSessionsService: CurriculumSessionsService) {}

    @Get()
    async findAll() {
        return await this.curriculumSessionsService.findAll();
    }
}