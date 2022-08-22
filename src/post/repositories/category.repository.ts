import { CustomRepository } from 'src/typeorm/custom.decorator';
import { ILike, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@CustomRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async existName(name: string): Promise<Category> {
    return await this.findOne({
      where: {
        name,
      },
    });
  }
}
