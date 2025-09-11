/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Task } from './../src/task/entities/task.entity';

describe('Task API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // clear DB
    await dataSource.getRepository(Task).clear();

    // seed 100 task (không đo thời gian)
    const tasks = Array.from({ length: 100 }).map((_, i) =>
      dataSource.getRepository(Task).create({
        title: `Task ${i + 1}`,
        description: `Desc ${i + 1}`,
        status: 0,
      }),
    );
    await dataSource.getRepository(Task).save(tasks);
  });

  it('(GET) → lấy 100 task và đo thời gian phản hồi', async () => {
    const start = Date.now();

    const res = await request(app.getHttpServer()).get('/task').expect(200);

    const duration = Date.now() - start;
    console.log(`⚡ GET /task with 100 records responded in ${duration}ms`);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(100);
    expect(duration).toBeLessThan(200); // hoặc tùy ngưỡng bạn muốn
  });
});
