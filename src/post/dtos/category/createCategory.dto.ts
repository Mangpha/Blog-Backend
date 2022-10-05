import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { Category } from 'src/post/entities/category.entity';

@InputType()
export class CreateCategoryInput extends PickType(Category, ['name']) {}

@ObjectType()
export class CreateCategoryOutput extends CommonOutput {
  @Field((type) => Int, { nullable: true })
  categoryId?: number;
}
