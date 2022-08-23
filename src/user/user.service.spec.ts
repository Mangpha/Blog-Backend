/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { User, UserRoles } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './user.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockUserRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
  findById: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'TestToken'),
  verify: jest.fn(),
});

const InternalServerErrorOutput = {
  success: false,
  error: 'Internal server error occurred.',
};

describe('User Service', () => {
  let service: UserService;
  let jwtService: JwtService;
  let userRepository: MockRepository<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useValue: mockUserRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(UserRepository));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Account', () => {
    const testingArgs = {
      email: 'test@account.com',
      password: 'testingPassword',
      username: 'testing',
    };

    it('should fail if email already exists', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.createAccount(testingArgs);
      expect(result).toMatchObject({
        success: false,
        error: 'Email already exists',
      });
    });

    it('should create account', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(testingArgs);
      userRepository.save.mockResolvedValue(testingArgs);
      const result = await service.createAccount(testingArgs);
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(testingArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(testingArgs);
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(testingArgs);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Login', () => {
    const user = {
      email: 'test@account.com',
      password: 'testpassword',
    };

    it('should fail if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await service.login(user);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toMatchObject({ success: false, error: 'User not found' });
    });

    it('should fail if password is wrong', async () => {
      const mockingUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockingUser);
      const result = await service.login(user);
      expect(result).toMatchObject({ success: false, error: 'Wrong Password' });
    });

    it('should success login then return token', async () => {
      const mockingUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockingUser);
      const result = await service.login(user);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toMatchObject({ success: true, token: 'TestToken' });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(user);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Find By Id', () => {
    it('should return value', async () => {
      // @ts-ignore
      userRepository.findById.mockResolvedValue(null);
      const result = await service.findById({ id: 1 });
      // @ts-ignore
      expect(userRepository.findById).toBeDefined();
      // @ts-ignore
      expect(userRepository.findById).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(userRepository.findById).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBeNull();
    });

    it('should fail on exception', async () => {
      // @ts-ignore
      userRepository.findById.mockRejectedValue(new Error());
      const result = await service.findById({ id: 1 });
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Edit Account', () => {
    it('should fail if email exists', async () => {
      const args = {
        userId: 1,
        input: { email: 'test@account.com' },
      };
      userRepository.findOneBy.mockResolvedValue({ id: 1 });
      const result = await service.editAccount(args.userId, args.input);
      expect(result).toMatchObject({
        success: false,
        error: 'Email already exists',
      });
    });

    it('should fail if username exists', async () => {
      const args = {
        userId: 1,
        input: { username: 'testing' },
      };
      userRepository.findOneBy.mockResolvedValue({ id: 1 });
      const result = await service.editAccount(args.userId, args.input);
      expect(result).toMatchObject({
        success: false,
        error: 'Username already exists',
      });
    });

    it('should modify profile', async () => {
      const args = {
        userId: 1,
        input: { password: 'test' },
      };
      userRepository.findOneBy.mockResolvedValue({
        id: 1,
        password: 'old password',
      });
      userRepository.save.mockResolvedValue({ ...args.input, id: 1 });
      const result = await service.editAccount(args.userId, args.input);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...args.input,
        id: 1,
      });
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      const args = {
        userId: 1,
        input: { username: 'testing' },
      };
      userRepository.findOneBy.mockRejectedValue(new Error());
      const result = await service.editAccount(args.userId, args.input);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Delete Account', () => {
    const user = 1;
    it('should delete account', async () => {
      userRepository.delete.mockResolvedValue({});
      const result = await service.deleteAccount(user);
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      userRepository.delete.mockRejectedValue(new Error());
      const result = await service.deleteAccount(user);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });
});
