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

const GUEST_USER = {
  email: 'guest@mail.com',
  username: 'Guest2031',
  password: 'guestPassword',
};

describe('Post Module (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let guestToken: string;
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

  it('Before Category E2E Testing | Create Account (Admin)', () => {
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
  it('Before Category E2E Testing | Create Account (Admin)', () => {
    return publicTest(`
      mutation {
          createAccount(input: {
            username: "${GUEST_USER.username}",
            email: "${GUEST_USER.email}",
            password: "${GUEST_USER.password}",
          }) {
            success
            error
            queryDate
          }
        }
    `);
  });
  it('Before Category E2E Testing | Login (Admin)', () => {
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
  it('Before Category E2E Testing | Login (Guest)', () => {
    return publicTest(`
      {
        login(input: {
          email: "${GUEST_USER.email}"
          password: "${GUEST_USER.password}"
        }) {
          success
          error
          token
        }
      }
    `).expect((res) => {
      const { token } = res.body.data.login;
      guestToken = token;
    });
  });
  it('Before Category E2E Testing | Change Role (Admin)', () => {
    return privateTest(`
      mutation {
        changeRole(input: {
          role: Admin
        }) {
          success
          error
        }
      }
    `);
  });
  it('Before Category E2E Testing | Change Role (User)', () => {
    return baseTest()
      .set('token', guestToken)
      .send({
        query: `
          mutation {
            changeRole(input: {
              role: User
            }) {
              success
              error
            }
          }
        `,
      });
  });
  it('Before Category E2E Testing | Create Post', () => {
    return privateTest(`
        mutation {
          createPost(input: {
            title: "test",
            content: "test content"
          }) {
            success
            error
          }
        }
      `);
  });

  const categoryName = 'TestCategory';

  describe('Create Category', () => {
    it('should create category', () => {
      return privateTest(`
        mutation {
          createCategory(input: {
            name: "${categoryName}"
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.createCategory;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });
    it('should fail if category name already exists', () => {
      return privateTest(`
        mutation {
          createCategory(input: {
            name: "${categoryName}"
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.createCategory;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });
  });

  describe('Find All Categories', () => {
    it('should return categories', () => {
      return privateTest(`
        {
          findAllCategories {
            success
            error
            categories {
              name
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            success,
            error,
            categories: [{ name }],
          } = res.body.data.findAllCategories;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
          expect(name).toEqual(expect.any(String));
        });
    });
  });

  describe('Edit Category', () => {
    const newName = 'newCategory';
    it('should change category name', () => {
      return privateTest(`
        mutation {
          editCategory(input: {
            id: 1,
            name: "${newName}"
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editCategory;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });
    it('should fail if category name already exists', () => {
      return privateTest(`
        mutation {
          editCategory(input: {
            id: 1,
            name: "${newName}"
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editCategory;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });
    it('should fail if category not found', () => {
      return privateTest(`
        mutation {
          editCategory(input: {
            id: 99,
            name: "${newName}"
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editCategory;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });
  });

  describe('Delete Category', () => {
    it('should fail if category not found', () => {
      return privateTest(`
        mutation {
          deleteCategory(input: {
            id: 99
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.deleteCategory;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });
    it('should delete a category', () => {
      return privateTest(`
        mutation {
          deleteCategory(input: {
            id: 1
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.deleteCategory;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });
  });
});
