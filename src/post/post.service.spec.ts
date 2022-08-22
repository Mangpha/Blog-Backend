import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/repositories/user.repository';
import { Repository } from 'typeorm';
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
});
