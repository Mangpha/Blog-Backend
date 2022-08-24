import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

const END_POINT = '/graphql';
const TEST_USER = {
  email: 'test@account.com',
  username: 'testAccount',
  password: 'testPassword',
};

describe('Post Module (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  const connection: DataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PSWD,
    database: process.env.DB_NAME,
  });

  const baseTest = () => request(app.getHttpServer()).post(END_POINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('token', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    await connection.initialize();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.destroy();
    await app.close();
  });

  it('Before Post E2E Testing | Create Account', () => {
    return publicTest(`
      mutation {
          createAccount(input: {
            username: "${TEST_USER.username}",
            email: "${TEST_USER.email}",
            password: "${TEST_USER.password}",
          }) {
            success
            error
            queryDate
          }
        }
    `);
  });

  it('Before Post E2E Testing | Login', () => {
    return publicTest(`
      {
        login(input: {
          email: "${TEST_USER.email}"
          password: "${TEST_USER.password}"
        }) {
          success
          error
          token
        }
      }
    `).expect((res) => {
      const { token } = res.body.data.login;
      jwtToken = token;
    });
  });

  describe('Create Post', () => {
    it.todo('Anything');
  });
});
