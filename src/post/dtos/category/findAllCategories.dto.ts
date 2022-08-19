import { Field, ObjectType } from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { Category } from 'src/post/entities/category.entity';

@ObjectType()
export class FindAllCategoriesOutput extends CommonOutput {
  @Field((type) => [Category], { nullable: true })
  categories?: Category[];
}
