import { Resolver } from '@nestjs/graphql';
import { Category } from './entities/category.entity';

@Resolver((of) => Category)
export class CategoryResolver {}
