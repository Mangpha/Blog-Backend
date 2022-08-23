/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/repositories/user.repository';
import { ILike, Repository } from 'typeorm';
import { PostService } from './post.service';
import { PostRepository } from './repositories/post.repository';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockPostRepository = () => ({
  save: jest.fn(),
  create: jest.fn(),
  findCount: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

const InternalServerErrorOutput = {
  success: false,
  error: 'Internal server error occurred.',
};

describe('Post Service', () => {
  let service: PostService;
  let postRepository: MockRepository<PostRepository>;
  let userRepository: MockRepository<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: getRepositoryToken(PostRepository),
          useValue: mockPostRepository(),
        },
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository(),
        },
      ],
    }).compile();
    service = module.get<PostService>(PostService);
    postRepository = module.get(getRepositoryToken(PostRepository));
    userRepository = module.get(getRepositoryToken(UserRepository));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Post', () => {
    const author = {
      id: 1,
      username: 'testname',
    };
    const payload = {
      title: 'testing',
      content: 'test content',
    };
    it('should create post', async () => {
      userRepository.findOne.mockResolvedValue(author);
      postRepository.create.mockReturnValue({ ...payload, author });
      postRepository.save.mockResolvedValue({ ...payload, author });
      const result = await service.createPost(author.id, payload);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: author.id },
      });
      expect(postRepository.create).toHaveBeenCalledTimes(1);
      expect(postRepository.create).toHaveBeenCalledWith({
        ...payload,
        author,
      });
      expect(postRepository.save).toHaveBeenCalledTimes(1);
      expect(postRepository.save).toHaveBeenCalledWith({ ...payload, author });
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockResolvedValue(author);
      postRepository.create.mockReturnValue({ ...payload, author });
      postRepository.save.mockRejectedValue(new Error());
      const result = await service.createPost(author.id, payload);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Find All Posts', () => {
    it('should find posts', async () => {
      // @ts-ignore
      postRepository.findCount.mockResolvedValue({
        success: true,
        posts: [
          {
            id: 1,
            title: 'test',
            content: 'content',
          },
        ],
      });
      const result = await service.findAllPosts({ page: 1 });
      // @ts-ignore
      expect(postRepository.findCount).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(postRepository.findCount).toHaveBeenCalledWith(1);
      expect(result).toMatchObject({
        success: true,
        posts: [
          {
            id: 1,
            title: 'test',
            content: 'content',
          },
        ],
      });
    });
    it('should fail on exception', async () => {
      // @ts-ignore
      postRepository.findCount.mockRejectedValue(new Error());
      const result = await service.findAllPosts({ page: 1 });
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Find Post By Id', () => {
    const post = { id: 1 };
    it('should fail if post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);
      const result = await service.findPostById(post);
      expect(result).toMatchObject({
        success: false,
        error: `Post ${post.id} not found`,
      });
    });

    it('should find post by id', async () => {
      postRepository.findOne.mockResolvedValue(post);
      const result = await service.findPostById(post);
      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: post.id,
        },
        relations: ['author'],
      });
      expect(result).toMatchObject({ success: true, post });
    });

    it('should fail on exception', async () => {
      postRepository.findOne.mockRejectedValue(new Error());
      const result = await service.findPostById(post);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Find Post By Title', () => {
    const payload = {
      query: 'test',
      page: 1,
    };
    it('should find post by title', async () => {
      // @ts-ignore
      postRepository.findCount.mockResolvedValue({
        success: true,
        posts: [{ id: 1 }],
      });
      const result = await service.findPostByTitle(payload);
      // @ts-ignore
      expect(postRepository.findCount).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(postRepository.findCount).toHaveBeenCalledWith(payload.page, {
        title: ILike(`%${payload.query}%`),
      });
      expect(result).toMatchObject({
        success: true,
        posts: [{ id: 1 }],
      });
    });

    it('should fail on exception', async () => {
      // @ts-ignore
      postRepository.findCount.mockRejectedValue(new Error());
      const result = await service.findPostByTitle(payload);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Edit Post', () => {
    const userId = 1;
    const payload = {
      postId: 1,
      title: 'edit test',
    };
    it('should fail if post not found', async () => {
      postRepository.findOne.mockResolvedValue(null);
      const result = await service.editPost(userId, payload);
      expect(result).toMatchObject({
        success: false,
        error: `Post ${payload.postId} Not found`,
      });
    });

    it('should fail if post is not own', async () => {
      postRepository.findOne.mockResolvedValue({
        post: {
          authorId: 2,
        },
      });
      const result = await service.editPost(userId, payload);
      expect(result).toMatchObject({
        success: false,
        error: 'Permission Denied',
      });
    });

    it('should modify the post', async () => {
      postRepository.findOne.mockResolvedValue({
        postId: 1,
        title: 'old title',
        authorId: 1,
      });
      postRepository.save.mockResolvedValue({ ...payload });
      const result = await service.editPost(userId, payload);
      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: payload.postId,
        },
        loadRelationIds: true,
      });
      expect(postRepository.save).toHaveBeenCalledTimes(1);
      expect(postRepository.save).toHaveBeenCalledWith({
        id: payload.postId,
        ...payload,
      });
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      postRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editPost(userId, payload);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Delete Post', () => {
    const authorId = 1;
    const payload = {
      id: 1,
    };
    it('should fail if post is not own', async () => {
      postRepository.findOne.mockResolvedValue({ id: 1, authorId: 2 });
      const result = await service.deletePost(authorId, payload);
      expect(result).toMatchObject({
        success: false,
        error: 'Permission Denied',
      });
    });

    it('should delete the post', async () => {
      postRepository.findOne.mockResolvedValue({ id: 1, authorId: 1 });
      postRepository.delete.mockResolvedValue(undefined);
      const result = await service.deletePost(authorId, payload);
      expect(postRepository.findOne).toHaveBeenCalledTimes(1);
      expect(postRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.id },
      });
      expect(postRepository.delete).toHaveBeenCalledTimes(1);
      expect(postRepository.delete).toHaveBeenCalledWith({ id: payload.id });
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      postRepository.findOne.mockRejectedValue(new Error());
      const result = await service.deletePost(authorId, payload);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Find Post By Category', () => {
    const payload = { page: 1, categoryId: 1 };
    it('should return the post', async () => {
      // @ts-ignore
      postRepository.findCount.mockResolvedValue({ post: [{ id: 1 }] });
      const result = await service.findPostByCategory(payload);
      // @ts-ignore
      expect(postRepository.findCount).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(postRepository.findCount).toHaveBeenCalledWith(payload.page, {
        category: {
          id: payload.categoryId,
        },
      });
      expect(result).toMatchObject({ post: [{ id: 1 }] });
    });

    it('should fail on exception', async () => {
      // @ts-ignore
      postRepository.findCount.mockRejectedValue(new Error());
      const result = await service.findPostByCategory(payload);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });
});
