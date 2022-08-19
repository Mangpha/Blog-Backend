import { Args, Resolver } from '@nestjs/graphql';
import { Roles } from 'src/auth/roles.decorator';
import { CategoryService } from './category.service';
import {
  CreateCategoryInput,
  CreateCategoryOutput,
} from './dtos/category/createCategory.dto';
import { Category } from './entities/category.entity';

@Resolver((of) => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles('Admin')
  createCategory(
    @Args('input') createCategoryInput: CreateCategoryInput,
  ): Promise<CreateCategoryOutput> {
    return this.categoryService.createCategory(createCategoryInput);
  }
}
