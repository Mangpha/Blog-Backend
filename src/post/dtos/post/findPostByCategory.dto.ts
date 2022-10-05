import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dto/pagination.dto';
import { Post } from 'src/post/entities/post.entity';

@InputType()
export class FindPostByCategoryInput extends PaginationInput {
  @Field((type) => Int)
  categoryId: number;
}

@ObjectType()
export class FindPostByCategoryOutput extends PaginationOutput {
  @Field((type) => [Post], { nullable: true })
  posts?: Post[];
}
