import { Injectable } from '@nestjs/common';
import { InternalServerErrorOutput } from 'src/common/common.error';
import {
  CreateCategoryInput,
  CreateCategoryOutput,
} from './dtos/category/createCategory.dto';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(
    createCategoryInput: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    try {
      const existName = await this.categoryRepository.findOne({
        where: { name: createCategoryInput.name },
      });
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
}
