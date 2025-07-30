import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurriculumSession } from '../../entities/curriculum-session.entity';
import { CreateCurriculumSessionDto } from './dto/create-curriculum-session.dto';
import { CURRICULUM_SESSION_ERROR_MESSAGES } from './constants/error-messages';
import { CurriculumsService } from './curriculums.service';

@Injectable()
export class CurriculumSessionsService {
  constructor(
    @InjectRepository(CurriculumSession)
    private sessionRepository: Repository<CurriculumSession>,
    private curriculumsService: CurriculumsService,
  ) {}

  // async create(createSessionDto: CreateCurriculumSessionDto): Promise<CurriculumSession> {
  //   try {
  //     // Verify curriculum exists
  //     await this.curriculumsService.findOne(createSessionDto.curriculumId);

  //     // Check if session with same name exists
  //     const existingSession = await this.sessionRepository.findOne({
  //       where: { name: createSessionDto.name },
  //     });

  //     if (existingSession) {
  //       throw new ConflictException(CURRICULUM_SESSION_ERROR_MESSAGES.ALREADY_EXISTS);
  //     }

  //     const session = this.sessionRepository.create(createSessionDto);
  //     return await this.sessionRepository.save(session);
  //   } catch (error) {
  //     if (error instanceof ConflictException) {
  //       throw error;
  //     }
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(CURRICULUM_SESSION_ERROR_MESSAGES.CURRICULUM_NOT_FOUND);
  //     }
  //     throw new BadRequestException(CURRICULUM_SESSION_ERROR_MESSAGES.CREATE_FAILED);
  //   }
  // }

  async findAll(): Promise<CurriculumSession[]> {
    try {
      return await this.sessionRepository.find();
    } catch (error) {
      throw new BadRequestException(CURRICULUM_SESSION_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  // async findOne(id: number): Promise<CurriculumSession> {
  //   try {
  //     const session = await this.sessionRepository.findOne({
  //       where: { id },
  //       relations: ['curriculum', 'items'],
  //     });

  //     if (!session) {
  //       throw new NotFoundException(CURRICULUM_SESSION_ERROR_MESSAGES.NOT_FOUND);
  //     }

  //     return session;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new BadRequestException(CURRICULUM_SESSION_ERROR_MESSAGES.INVALID_ID);
  //   }
  // }

  // async findByCurriculum(curriculumId: number): Promise<CurriculumSession[]> {
  //   try {
  //     // Verify curriculum exists
  //     await this.curriculumsService.findOne(curriculumId);

  //     return await this.sessionRepository.find({
  //       where: { curriculumId },
  //       relations: ['curriculum', 'items'],
  //       order: {
  //         created_at: 'DESC',
  //       },
  //     });
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(CURRICULUM_SESSION_ERROR_MESSAGES.CURRICULUM_NOT_FOUND);
  //     }
  //     throw new BadRequestException(CURRICULUM_SESSION_ERROR_MESSAGES.NOT_FOUND);
  //   }
  // }

  // async update(id: number, updateSessionDto: CreateCurriculumSessionDto): Promise<CurriculumSession> {
  //   try {
  //     const session = await this.findOne(id);

  //     // Verify curriculum exists
  //     await this.curriculumsService.findOne(updateSessionDto.curriculumId);

  //     // Check if new name conflicts with existing session
  //     if (updateSessionDto.name !== session.name) {
  //       const existingSession = await this.sessionRepository.findOne({
  //         where: { name: updateSessionDto.name },
  //       });

  //       if (existingSession) {
  //         throw new ConflictException(CURRICULUM_SESSION_ERROR_MESSAGES.ALREADY_EXISTS);
  //       }
  //     }

  //     Object.assign(session, updateSessionDto);
  //     return await this.sessionRepository.save(session);
  //   } catch (error) {
  //     if (error instanceof NotFoundException || error instanceof ConflictException) {
  //       throw error;
  //     }
  //     throw new BadRequestException(CURRICULUM_SESSION_ERROR_MESSAGES.UPDATE_FAILED);
  //   }
  // }

  // async remove(id: number): Promise<void> {
  //   try {
  //     const result = await this.sessionRepository.delete(id);
  //     if (result.affected === 0) {
  //       throw new NotFoundException(CURRICULUM_SESSION_ERROR_MESSAGES.NOT_FOUND);
  //     }
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new BadRequestException(CURRICULUM_SESSION_ERROR_MESSAGES.DELETE_FAILED);
  //   }
  // }
} 