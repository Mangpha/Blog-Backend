/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService } from './category.service';
import { CategoryRepository } from './repositories/category.repository';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockCategoryRepository = () => ({
  existName: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

const InternalServerErrorOutput = {
  success: false,
  error: 'Internal server error occurred.',
};

describe('Category Service', () => {
  let service: CategoryService;
  let categoryRepository: MockRepository<CategoryRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(CategoryRepository),
          useValue: mockCategoryRepository(),
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepository = module.get(getRepositoryToken(CategoryRepository));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Category', () => {
    const payload = {
      name: 'test',
    };
    it('should fail if category name already exists', async () => {
      // @ts-ignore
      categoryRepository.existName.mockResolvedValue({ id: 1 });
      const result = await service.createCategory(payload);
      expect(result).toMatchObject({
        success: false,
        error: 'Category name already exists',
      });
    });

    it('should create a category', async () => {
      // @ts-ignore
      categoryRepository.existName.mockResolvedValue(null);
      categoryRepository.create.mockReturnValue({ id: 1, ...payload });
      categoryRepository.save.mockResolvedValue({ id: 1, ...payload });
      const result = await service.createCategory(payload);
      // @ts-ignore
      expect(categoryRepository.existName).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(categoryRepository.existName).toHaveBeenCalledWith(payload.name);
      expect(categoryRepository.create).toHaveBeenCalledTimes(1);
      expect(categoryRepository.create).toHaveBeenCalledWith(payload);
      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith({
        id: 1,
        ...payload,
      });
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      // @ts-ignore
      categoryRepository.existName.mockRejectedValue(new Error());
      const result = await service.createCategory(payload);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Find All Categories', () => {
    it('should fail if categories not found', async () => {
      categoryRepository.find.mockResolvedValue(null);
      const result = await service.findAllCategories();
      expect(result).toMatchObject({
        success: false,
        error: 'Categories not found',
      });
    });

    it('should return categories', async () => {
      const categories = [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ];
      categoryRepository.find.mockResolvedValue(categories);
      const result = await service.findAllCategories();
      expect(categoryRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({ success: true, categories });
    });

    it('should fail on exception', async () => {
      categoryRepository.find.mockRejectedValue(new Error());
      const result = await service.findAllCategories();
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Edit Category', () => {
    const payload = {
      id: 1,
      name: 'new name',
    };
    it('should fail if category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      const result = await service.editCategory(payload);
      expect(result).toMatchObject({
        success: false,
        error: `Category ${payload.id} not found`,
      });
    });

    it('should fail if category name already exists', async () => {
      categoryRepository.findOne.mockResolvedValue({ id: 1 });
      // @ts-ignore
      categoryRepository.existName.mockResolvedValue({ id: 1 });
      const result = await service.editCategory(payload);
      expect(result).toMatchObject({
        success: false,
        error: 'Category Name already exists',
      });
    });

    it('should modify the category', async () => {
      categoryRepository.findOne.mockResolvedValue({ id: 1, name: 'old name' });
      // @ts-ignore
      categoryRepository.existName.mockResolvedValue(null);
      categoryRepository.save.mockResolvedValue({ id: 1, ...payload });
      const result = await service.editCategory(payload);
      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.id },
      });
      // @ts-ignore
      expect(categoryRepository.existName).toHaveBeenCalledTimes(1);
      // @ts-ignore
      expect(categoryRepository.existName).toHaveBeenCalledWith(payload.name);
      expect(categoryRepository.save).toHaveBeenCalledTimes(1);
      expect(categoryRepository.save).toHaveBeenCalledWith({
        id: 1,
        ...payload,
      });
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      categoryRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editCategory(payload);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });

  describe('Delete Category', () => {
    const payload = {
      id: 1,
    };
    it('should fail if category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);
      const result = await service.deleteCategory(payload);
      expect(result).toMatchObject({
        success: false,
        error: `Category ${payload.id} not found`,
      });
    });

    it('should delete the category', async () => {
      categoryRepository.findOne.mockResolvedValue({ id: 1 });
      categoryRepository.delete.mockResolvedValue(undefined);
      const result = await service.deleteCategory(payload);
      expect(categoryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { ...payload },
      });
      expect(categoryRepository.delete).toHaveBeenCalledTimes(1);
      expect(categoryRepository.delete).toHaveBeenCalledWith({ ...payload });
      expect(result).toMatchObject({ success: true });
    });

    it('should fail on exception', async () => {
      categoryRepository.findOne.mockRejectedValue(new Error());
      const result = await service.deleteCategory(payload);
      expect(result).toMatchObject(InternalServerErrorOutput);
    });
  });
});
