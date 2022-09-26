import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dto/pagination.dto';
import { Post } from '../../entities/post.entity';

@InputType()
export class FindAllPostsInput extends PaginationInput {
  @Field((type) => Int, { defaultValue: 5 })
  take?: number;
}

@ObjectType()
export class FindAllPostsOutput extends PaginationOutput {
  @Field((type) => [Post], { nullable: true })
  posts?: Post[];
}
