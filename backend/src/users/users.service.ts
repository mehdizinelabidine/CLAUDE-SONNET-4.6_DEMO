import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../storage/storage.service';
import { User } from '../shared/interfaces';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly storage: StorageService) {}

  async findAll(): Promise<User[]> {
    return this.storage.readUsers<User>();
  }

  async findById(id: string): Promise<User> {
    const users = await this.storage.readUsers<User>();
    const user = users.find((u) => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByClerkId(clerkUserId: string): Promise<User | undefined> {
    const users = await this.storage.readUsers<User>();
    return users.find((u) => u.clerkUserId === clerkUserId);
  }

  async create(dto: CreateUserDto): Promise<User> {
    const users = await this.storage.readUsers<User>();
    const exists = users.find((u) => u.email === dto.email);
    if (exists) throw new ConflictException(`Email ${dto.email} already in use`);

    const user: User = {
      id: uuidv4(),
      name: dto.name,
      email: dto.email,
      role: dto.role,
      createdAt: new Date().toISOString(),
      ...(dto.clerkUserId && { clerkUserId: dto.clerkUserId }),
    };

    await this.storage.writeUsers([...users, user]);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const users = await this.storage.readUsers<User>();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException(`User ${id} not found`);

    users[index] = { ...users[index], ...dto };
    await this.storage.writeUsers(users);
    return users[index];
  }

  async upsertByClerkId(clerkUserId: string, data: Partial<User>): Promise<User> {
    const existing = await this.findByClerkId(clerkUserId);
    if (existing) {
      return this.update(existing.id, { name: data.name, role: data.role });
    }
    return this.create({
      name: data.name!,
      email: data.email!,
      role: data.role ?? 'employee',
      clerkUserId,
    });
  }
}
