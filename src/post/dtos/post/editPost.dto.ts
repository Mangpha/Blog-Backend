import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { CreatePostInput } from './createPost.dto';

@InputType()
export class EditPostInput extends PartialType(CreatePostInput) {
  @Field((type) => Int)
  postId: number;
}

@ObjectType()
export class EditPostOutput extends CommonOutput {}
