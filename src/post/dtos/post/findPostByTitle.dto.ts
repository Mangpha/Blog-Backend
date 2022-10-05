import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/dto/pagination.dto';
import { Post } from '../../entities/post.entity';

@InputType()
export class FindPostByTitleInput extends PaginationInput {
  @Field((type) => String)
  query: string;
}

@ObjectType()
export class FindPostByTitleOutput extends PaginationOutput {
  @Field((type) => [Post], { nullable: true })
  posts?: Post[];
}
