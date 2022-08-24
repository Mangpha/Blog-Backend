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

describe('User Module (e2e)', () => {
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

  describe('Create Account', () => {
    it('should create account', () => {
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
      `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.success).toBeTruthy();
          expect(res.body.data.createAccount.error).toBeNull();
        });
    });

    it('should fail if email already exists', () => {
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
      `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.success).toBeFalsy();
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });

    it('should fail if username already exists', () => {
      return publicTest(`
        mutation {
          createAccount(input: {
            username: "${TEST_USER.username}",
            email: "unique@email.com",
            password: "${TEST_USER.password}",
          }) {
            success
            error
            queryDate
          }
        }
      `);
    });
  });

  describe('Login', () => {
    it('should success to login', () => {
      return publicTest(`
        {
          login(input: { email: "${TEST_USER.email}", password: "${TEST_USER.password}" }) {
            success
            error
            token
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, token } = res.body.data.login;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
          expect(token).toEqual(expect.any(String));
          jwtToken = token;
        });
    });

    it('should fail if user not found', () => {
      return publicTest(`
        {
          login(input: { email: "wrong@email.com", password: "wrong password" }) {
            success
            error
            queryDate
            token
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, token } = res.body.data.login;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
          expect(token).toBeNull();
        });
    });

    it('should fail if password is wrong', () => {
      return publicTest(`
      {
        login(input: { email: "${TEST_USER.email}", password: "wrong password" }) {
          success
          error
          queryDate
          token
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, token } = res.body.data.login;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
          expect(token).toBeNull();
        });
    });
  });

  describe('My Data', () => {
    it('should return my profile', () => {
      return privateTest(`
      {
        myData {
          id
          email
          username
          role
        }
      }
    `)
        .expect(200)
        .expect((res) => {
          const { id, email, username, role } = res.body.data.myData;
          expect(id).toEqual(expect.any(Number));
          expect(email).toEqual(expect.any(String));
          expect(username).toEqual(expect.any(String));
          expect(role).toEqual(expect.any(String));
        });
    });

    it('should fail if user not logged in', () => {
      return publicTest(`
        {
          myData {
            id
            email
            username
            role
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const [{ message }] = res.body.errors;
          expect(message).toEqual(expect.any(String));
        });
    });
  });

  describe('Edit Account', () => {
    const NEW_EMAIL = 'new@email.com';
    const NEW_USERNAME = 'new_username';

    it('should fail if email already exists', () => {
      return privateTest(`
        mutation {
          editAccount(input: {
            email: "${TEST_USER.email}"
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editAccount;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });

    it('should fail if username already exists', () => {
      return privateTest(`
        mutation {
          editAccount(input: {
            username: "${TEST_USER.username}"
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editAccount;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });

    it('should change email', () => {
      return privateTest(`
        mutation {
          editAccount(input: {
            email: "${NEW_EMAIL}"
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editAccount;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should change username', () => {
      return privateTest(`
          mutation {
            editAccount(input: {
              username: "${NEW_USERNAME}"
            }) {
              success
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editAccount;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should have new data', () => {
      return privateTest(`
          {
            myData {
              email
              username
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          const { email, username } = res.body.data.myData;
          expect(email).toBe(NEW_EMAIL);
          expect(username).toBe(NEW_USERNAME);
        });
    });
  });

  describe('Find User By Id', () => {
    it('should return user data by id', () => {
      return publicTest(`
        {
          findUserById(input: {
            id: 1
          }) {
            success
            error
            user {
              email
              username
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, user } = res.body.data.findUserById;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
          expect(user.email).toEqual(expect.any(String));
          expect(user.username).toEqual(expect.any(String));
        });
    });

    it('should fail if user not found', () => {
      return publicTest(`
        {
          findUserById(input: {
            id: 99
          }) {
            success
            error
            user {
              email
              username
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, user } = res.body.data.findUserById;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
          expect(user).toBeNull();
        });
    });
  });

  describe('Change Role', () => {
    it('should change role', () => {
      return privateTest(`
        mutation {
          changeRole(input: {
            role: User
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.changeRole;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should fail if user not logged in', () => {
      return publicTest(`
        mutation {
          changeRole(input: {
            role: User
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const [{ message }] = res.body.errors;
          expect(message).toEqual(expect.any(String));
        });
    });
  });

  describe('Delete Account', () => {
    it('should delete account', () => {
      return privateTest(`
        mutation {
          deleteAccount {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.deleteAccount;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should not return user after delete account', () => {
      return publicTest(`
        {
          findUserById(input: {
            id: 1
          }) {
            success
            error
            user {
              email
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, user } = res.body.data.findUserById;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
          expect(user).toBeNull();
        });
    });
  });
});
