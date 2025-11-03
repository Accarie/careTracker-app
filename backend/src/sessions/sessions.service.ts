import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private sessionsRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const session = this.sessionsRepository.create({
      ...createSessionDto,
      date: new Date(createSessionDto.date),
    });
    return this.sessionsRepository.save(session);
  }

  async findAll(filters?: { programId?: string; patientId?: string; status?: string; startDate?: string; endDate?: string }): Promise<Session[]> {
    const query = this.sessionsRepository.createQueryBuilder('session')
      .leftJoinAndSelect('session.program', 'program')
      .leftJoinAndSelect('session.patient', 'patient');

    if (filters?.programId) {
      query.andWhere('session.programId = :programId', { programId: filters.programId });
    }

    if (filters?.patientId) {
      query.andWhere('session.patientId = :patientId', { patientId: filters.patientId });
    }

    if (filters?.status) {
      query.andWhere('session.status = :status', { status: filters.status });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('session.date BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: ['program', 'patient'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    const session = await this.findOne(id);
    
    if (updateSessionDto.date) {
      updateSessionDto.date = new Date(updateSessionDto.date).toISOString();
    }

    Object.assign(session, updateSessionDto);
    return this.sessionsRepository.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.sessionsRepository.delete(id);
  }

  async markMissedSessions(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const missedSessions = await this.sessionsRepository.find({
      where: {
        date: Between(new Date(0), today),
        status: SessionStatus.ATTENDED,
      },
    });

    // Update status to MISSED if not attended and date has passed
    const sessionsToUpdate = await this.sessionsRepository
      .createQueryBuilder('session')
      .where('session.date < :today', { today })
      .andWhere('session.status = :attended', { attended: SessionStatus.ATTENDED })
      .getMany();

    for (const session of sessionsToUpdate) {
      session.status = SessionStatus.MISSED;
    }

    await this.sessionsRepository.save(sessionsToUpdate);
    return sessionsToUpdate.length;
  }
}

