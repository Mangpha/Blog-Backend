import { CustomRepository } from 'src/typeorm/custom.decorator';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@CustomRepository(Category)
export class CategoryRepository extends Repository<Category> {}