import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CommonOutput } from 'src/common/dto/common.dto';
import { Post } from '../entities/post.entity';
import { CreatePostInput } from './createPost.dto';

@InputType()
export class EditPostInput extends PartialType(CreatePostInput) {
  @Field((type) => Int)
  postId: number;
}

@ObjectType()
export class EditPostOutput extends CommonOutput {}
