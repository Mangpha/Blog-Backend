import { Injectable } from '@nestjs/common';
import { InternalServerErrorOutput } from 'src/common/common.error';
import { ILike } from 'typeorm';
import {
  CreateCategoryInput,
  CreateCategoryOutput,
} from './dtos/category/createCategory.dto';
import {
  EditCategoryInput,
  EditCategoryOutput,
} from './dtos/category/editCategory.dto';
import { FindAllCategoriesOutput } from './dtos/category/findAllCategories.dto';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(
    createCategoryInput: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    try {
      const existName = await this.categoryRepository.existName(
        createCategoryInput.name,
      );
      if (existName)
        return { success: false, error: 'Category name already exists' };
      await this.categoryRepository.save(
        this.categoryRepository.create(createCategoryInput),
      );
      return { success: true };
    } catch {
      return InternalServerErrorOutput;
    }
  }

  async findAllCategories(): Promise<FindAllCategoriesOutput> {
    try {
      const categories = await this.categoryRepository.find();
      if (!categories) return { success: false, error: 'Categories not found' };
      return { success: true, categories };
    } catch {
      return InternalServerErrorOutput;
    }
  }

  async editCategory({
    id,
    name,
  }: EditCategoryInput): Promise<EditCategoryOutput> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category)
        return { success: false, error: `Category ${id} not found` };
      const existName = await this.categoryRepository.existName(name);
      if (existName)
        return { success: false, error: 'Category Name already exists' };
      await this.categoryRepository.save({ ...category, name });
      return { success: true };
    } catch {
      return InternalServerErrorOutput;
    }
  }
}
