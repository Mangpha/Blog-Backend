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

  it('Before Post E2E Testing | Create Account (Admin)', () => {
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

  it('Before Post E2E Testing | Create Account (Admin)', () => {
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
  it('Before Post E2E Testing | Login (Admin)', () => {
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
  it('Before Post E2E Testing | Login (Guest)', () => {
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
  it('Before Post E2E Testing | Change Role (Admin)', () => {
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
  it('Before Post E2E Testing | Change Role (User)', () => {
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

  describe('Create Post', () => {
    it('should create a post', () => {
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
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.createPost;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should fail if user not logged in', () => {
      return publicTest(`
        mutation {
          createPost(input: {
            title: "test",
            content: "test content"
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

  describe('Find All Posts', () => {
    it('should return all posts', () => {
      return publicTest(`
        {
          findAllPosts(input: {}) {
            success
            error
            posts {
              title
              content
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, posts } = res.body.data.findAllPosts;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
          expect(posts).toEqual(expect.any(Array));
        });
    });
  });

  describe('Find Post By Id', () => {
    it('should fail if post not found', () => {
      return publicTest(`
        {
          findPostById(input: { id: 99 }) {
            success
            error
            post {
              title
              content
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, post } = res.body.data.findPostById;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
          expect(post).toBeNull();
        });
    });

    it('should return the post', () =>
      publicTest(`
      {
          findPostById(input: { id: 1 }) {
            success
            error
            post {
              title
              content
            }
          }
        }
    `)
        .expect(200)
        .expect((res) => {
          const { success, error, post } = res.body.data.findPostById;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
          expect(post).toEqual(expect.any(Object));
          expect(post.title).toEqual(expect.any(String));
          expect(post.content).toEqual(expect.any(String));
        }));
  });

  describe('Edit Post', () => {
    const NEW_POST = {
      postId: 1,
      title: 'NEW POST TITLE',
    };
    it('should fail if post not found', () => {
      return privateTest(`
        mutation {
          editPost(input: {
            postId: 99,
            title: "${NEW_POST.title}",
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editPost;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });

    it('should fail if post is not own', () => {
      return baseTest()
        .set('token', guestToken)
        .send({
          query: `
            mutation {
              editPost(input: {
                postId: ${NEW_POST.postId},
                title: "${NEW_POST.title}",
              }) {
                success
                error
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editPost;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });

    it('should change title', () => {
      return privateTest(`
        mutation {
          editPost(input: {
            postId: 1,
            title: "${NEW_POST.title}",
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.editPost;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should return new title', () => {
      return publicTest(`
        {
          findPostById(input: {
            id: ${NEW_POST.postId}
          }) {
            success
            error
            post {
              title
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, post } = res.body.data.findPostById;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
          expect(post.title).toBe(NEW_POST.title);
        });
    });
  });

  describe('Find Post By Title', () => {
    const query = 'NEW';

    it('should fail if post not found', () => {
      return publicTest(`
        {
          findPostByTitle(input: { query: "ERROR" }) {
            success
            error
            posts {
              title
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error, posts } = res.body.data.findPostByTitle;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
          expect(posts).toBeNull();
        });
    });

    it('should return the post', () => {
      return publicTest(`
        {
          findPostByTitle(input: { query: "${query}" }) {
            success
            error
            posts {
              title
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const {
            success,
            error,
            posts: [{ title }],
          } = res.body.data.findPostByTitle;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
          expect(title).toEqual(expect.any(String));
        });
    });
  });

  describe('Delete Post', () => {
    it('should fail if post is not own', () => {
      return baseTest()
        .set('token', guestToken)
        .send({
          query: `
            mutation {
              deletePost(input: {
                id: 1
              }) {
                success
                error
              }
          }
        `,
        })
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.deletePost;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });

    it('should delete post', () => {
      return privateTest(`
        mutation {
          deletePost(input: {
            id: 1
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.deletePost;
          expect(success).toBeTruthy();
          expect(error).toBeNull();
        });
    });

    it('should not return a post', () => {
      return publicTest(`
        {
          findPostById(input: {
            id: 1
          }) {
            success
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { success, error } = res.body.data.findPostById;
          expect(success).toBeFalsy();
          expect(error).toEqual(expect.any(String));
        });
    });
  });
});
