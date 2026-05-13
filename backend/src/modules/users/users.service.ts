import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async onModuleInit() {
    const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@crmvendas.local').toLowerCase();
    const exists = await this.repo.findOne({ where: { email } });
    if (exists) return;
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'Admin@123';
    const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(password, rounds);
    const user = this.repo.create({
      email,
      passwordHash,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    });
    await this.repo.save(user);
    this.logger.log(`Bootstrap SUPER_ADMIN created: ${email}`);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const email = dto.email.toLowerCase().trim();
    if (await this.repo.findOne({ where: { email } })) {
      throw new ConflictException('Email already registered');
    }
    const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(dto.password, rounds);
    const user = this.repo.create({
      email,
      name: dto.name,
      phone: dto.phone ?? null,
      role: dto.role ?? UserRole.SALES,
      organizationId: dto.organizationId ?? null,
      passwordHash,
    });
    return this.repo.save(user);
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email: email.toLowerCase().trim() })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateById(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async setOrganization(userId: string, organizationId: string | null): Promise<User> {
    const user = await this.findById(userId);
    user.organizationId = organizationId;
    return this.repo.save(user);
  }

  async setRole(userId: string, role: UserRole): Promise<User> {
    const user = await this.findById(userId);
    user.role = role;
    return this.repo.save(user);
  }

  async setPassword(userId: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }
    const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(newPassword, rounds);
    await this.repo.update({ id: userId }, { passwordHash });
  }

  async markEmailVerified(userId: string) {
    await this.repo.update({ id: userId }, { emailVerified: true });
  }

  async touchLastLogin(userId: string) {
    await this.repo.update({ id: userId }, { lastLoginAt: new Date() });
  }

  async list(pagination: PaginationDto, organizationId?: string | null): Promise<PaginatedResult<User>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const qb = this.repo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC');
    if (organizationId !== undefined) {
      if (organizationId === null) qb.where('u.organizationId IS NULL');
      else qb.where('u.organizationId = :orgId', { orgId: organizationId });
    }
    if (pagination.search) {
      qb.andWhere('(LOWER(u.name) LIKE :s OR LOWER(u.email) LIKE :s)', {
        s: `%${pagination.search.toLowerCase()}%`,
      });
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }
}
