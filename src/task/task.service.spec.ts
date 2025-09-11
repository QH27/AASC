import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

describe('TaskService', () => {
  let service: TaskService;
  let repository: Repository<Task>;

  const mockTask = { id: 99999, title: 'Test Task', description: 'Demo' };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockTask),
    save: jest.fn().mockResolvedValue(mockTask),
    find: jest.fn().mockResolvedValue([mockTask]),
    findOneBy: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task', async () => {
    const dto = { title: 'Test Task', description: 'Demo' };
    const result = await service.create(dto);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(mockTask);
    expect(result).toEqual(mockTask);
  });
});
